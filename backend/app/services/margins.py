from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd

from ..models.entities import Product, Sale, InventoryBatch

def get_profit_margin_analysis(db: Session, category: Optional[str] = None) -> Dict[str, Any]:
    """
    Computes gross margins, spoilage waste erosion, and net margins after waste
    per SKU and category, categorizing products into 4 strategic quadrants.
    """
    products_query = db.query(Product).filter(Product.is_active == True)
    if category and category != "All":
        products_query = products_query.filter(Product.category == category)
    products = products_query.all()

    # Sales aggregation by product
    sales_agg = (
        db.query(
            Sale.product_id,
            func.sum(Sale.quantity_sold).label("total_sold_qty"),
            func.sum(Sale.revenue).label("total_revenue"),
            func.sum(Sale.total_cost).label("total_cost"),
        )
        .group_by(Sale.product_id)
        .all()
    )
    sales_map = {s.product_id: s for s in sales_agg}

    # Inventory & waste aggregation by product
    inv_agg = (
        db.query(
            InventoryBatch.product_id,
            func.sum(InventoryBatch.quantity_received).label("total_received_qty"),
            func.sum(InventoryBatch.quantity_wasted).label("total_wasted_qty"),
            func.sum(InventoryBatch.waste_cost).label("total_waste_cost"),
        )
        .group_by(InventoryBatch.product_id)
        .all()
    )
    inv_map = {i.product_id: i for i in inv_agg}

    sku_analysis = []
    total_rev = 0.0
    total_cogs = 0.0
    total_waste = 0.0

    category_buckets: Dict[str, Dict[str, float]] = {}

    for prod in products:
        s_data = sales_map.get(prod.product_id)
        i_data = inv_map.get(prod.product_id)

        sold_qty = float(s_data.total_sold_qty or 0.0) if s_data else 0.0
        revenue = float(s_data.total_revenue or 0.0) if s_data else 0.0
        cogs = float(s_data.total_cost or 0.0) if s_data else (sold_qty * prod.unit_cost)

        received_qty = float(i_data.total_received_qty or 0.0) if i_data else (sold_qty * 1.1)
        wasted_qty = float(i_data.total_wasted_qty or 0.0) if i_data else 0.0
        waste_cost = float(i_data.total_waste_cost or 0.0) if i_data else (wasted_qty * prod.unit_cost)

        gross_profit = revenue - cogs
        gross_margin_pct = (gross_profit / revenue * 100.0) if revenue > 0 else 0.0

        waste_rate_pct = (wasted_qty / received_qty * 100.0) if received_qty > 0 else 0.0
        net_profit_after_waste = gross_profit - waste_cost
        net_margin_pct = (net_profit_after_waste / revenue * 100.0) if revenue > 0 else 0.0

        total_rev += revenue
        total_cogs += cogs
        total_waste += waste_cost

        # Determine Quadrant
        # High Margin threshold: 25%, High Waste threshold: 7.5%
        if net_margin_pct >= 25.0 and waste_rate_pct < 7.5:
            quadrant = "Star"
            quadrant_label = "High Margin, Low Waste"
            action = "Scale volume & maintain safety buffer"
            color = "#16a34a"  # Green
        elif net_margin_pct < 25.0 and waste_rate_pct < 7.5:
            quadrant = "Cash Cow"
            quadrant_label = "Stable Staple, Low Waste"
            action = "Steady volume; negotiate supplier bulk price"
            color = "#0284c7"  # Blue
        elif net_margin_pct >= 20.0 and waste_rate_pct >= 7.5:
            quadrant = "High Spoilage Risk"
            quadrant_label = "High Margin, High Waste"
            action = "Deploy dynamic markdowns; cut batch size 15%"
            color = "#f59e0b"  # Amber
        else:
            quadrant = "Critical Attention"
            quadrant_label = "Low Margin, High Waste"
            action = "Reprice +10%, bundle with high-margin items, or review"
            color = "#e11d48"  # Rose

        item_dict = {
            "product_id": prod.product_id,
            "product_name": prod.name,
            "category": prod.category,
            "unit": prod.unit,
            "unit_price": prod.unit_price,
            "unit_cost": prod.unit_cost,
            "quantity_sold": round(sold_qty, 1),
            "revenue": round(revenue, 2),
            "cogs": round(cogs, 2),
            "gross_profit": round(gross_profit, 2),
            "gross_margin_pct": round(gross_margin_pct, 1),
            "wasted_quantity": round(wasted_qty, 1),
            "waste_cost": round(waste_cost, 2),
            "waste_rate_pct": round(waste_rate_pct, 1),
            "net_profit_after_waste": round(net_profit_after_waste, 2),
            "net_margin_pct": round(net_margin_pct, 1),
            "quadrant": quadrant,
            "quadrant_label": quadrant_label,
            "recommended_action": action,
            "color": color,
        }
        sku_analysis.append(item_dict)

        # Aggregate category
        cat = prod.category
        if cat not in category_buckets:
            category_buckets[cat] = {"revenue": 0.0, "cogs": 0.0, "waste_cost": 0.0, "sold_qty": 0.0}
        category_buckets[cat]["revenue"] += revenue
        category_buckets[cat]["cogs"] += cogs
        category_buckets[cat]["waste_cost"] += waste_cost
        category_buckets[cat]["sold_qty"] += sold_qty

    # Category summaries
    category_summary = []
    for cat, vals in category_buckets.items():
        rev = vals["revenue"]
        gp = rev - vals["cogs"]
        wc = vals["waste_cost"]
        np = gp - wc
        gm_pct = (gp / rev * 100.0) if rev > 0 else 0.0
        nm_pct = (np / rev * 100.0) if rev > 0 else 0.0
        category_summary.append({
            "category": cat,
            "revenue": round(rev, 2),
            "gross_profit": round(gp, 2),
            "gross_margin_pct": round(gm_pct, 1),
            "waste_cost": round(wc, 2),
            "net_profit": round(np, 2),
            "net_margin_pct": round(nm_pct, 1),
        })

    category_summary.sort(key=lambda x: x["revenue"], reverse=True)

    # Sort SKUs by highest waste cost impact
    sku_analysis.sort(key=lambda x: x["waste_cost"], reverse=True)

    overall_gross_margin = ((total_rev - total_cogs) / total_rev * 100.0) if total_rev > 0 else 0.0
    overall_net_margin = ((total_rev - total_cogs - total_waste) / total_rev * 100.0) if total_rev > 0 else 0.0
    waste_margin_erosion_pct = overall_gross_margin - overall_net_margin

    return {
        "summary": {
            "total_revenue": round(total_rev, 2),
            "total_cogs": round(total_cogs, 2),
            "gross_profit": round(total_rev - total_cogs, 2),
            "gross_margin_pct": round(overall_gross_margin, 1),
            "total_waste_cost": round(total_waste, 2),
            "net_profit_after_waste": round(total_rev - total_cogs - total_waste, 2),
            "net_margin_pct": round(overall_net_margin, 1),
            "waste_margin_erosion_pct": round(waste_margin_erosion_pct, 1),
        },
        "quadrant_counts": {
            "stars": sum(1 for s in sku_analysis if s["quadrant"] == "Star"),
            "cash_cows": sum(1 for s in sku_analysis if s["quadrant"] == "Cash Cow"),
            "high_risk": sum(1 for s in sku_analysis if s["quadrant"] == "High Spoilage Risk"),
            "drainers": sum(1 for s in sku_analysis if s["quadrant"] == "Critical Attention"),
        },
        "category_summary": category_summary,
        "sku_analysis": sku_analysis,
    }
