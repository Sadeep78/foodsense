from datetime import date, timedelta, datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.entities import InventoryBatch, Product, BatchDiscountRecord

def calculate_discount_suggestions(db: Session, alert_threshold_days: int = 3) -> Dict[str, Any]:
    """
    Computes optimal price markdown percentage for near-expiry inventory batches
    using a price-elasticity optimization function.
    """
    today = date.today()
    max_expiry_date = today + timedelta(days=alert_threshold_days)

    # Prefetch products
    products_map = {p.product_id: p for p in db.query(Product).all()}

    # Get active batches nearing expiry
    batches = (
        db.query(InventoryBatch)
        .filter(
            InventoryBatch.current_quantity > 0,
            InventoryBatch.expiry_date >= today,
            InventoryBatch.expiry_date <= max_expiry_date,
            InventoryBatch.status != "Discounted"
        )
        .order_by(InventoryBatch.expiry_date.asc())
        .all()
    )

    suggestions: List[Dict[str, Any]] = []
    total_potential_recovery = 0.0

    for batch in batches:
        prod = products_map.get(batch.product_id)
        if not prod:
            continue

        days_left = max(0, (batch.expiry_date - today).days)
        orig_price = prod.unit_price

        # Elasticity score calibrated by category
        # Bakery & Prepared meals have high elasticity (quick consumption impulse buy)
        # Fresh produce has moderate elasticity
        if prod.category in ["Bakery", "Cooked Meals"]:
            elasticity = 2.2
        elif prod.category in ["Dairy", "Meat & Fish"]:
            elasticity = 1.9
        else:
            elasticity = 1.6

        # Step-down discount model based on urgency
        if days_left <= 0:  # Expiring today
            discount_pct = 50.0
        elif days_left == 1:
            discount_pct = 40.0
        elif days_left == 2:
            discount_pct = 30.0
        else:
            discount_pct = 20.0

        discounted_price = round(orig_price * (1.0 - (discount_pct / 100.0)), 2)

        # Expected clearance volume under elasticity
        # Q_clear = Q * (1 + elasticity * discount) scaled by urgency
        boost_factor = 1.0 + (elasticity * (discount_pct / 100.0))
        expected_units = round(min(batch.current_quantity, batch.current_quantity * min(1.0, 0.45 * boost_factor)), 1)
        if expected_units == 0 and batch.current_quantity > 0:
            expected_units = min(batch.current_quantity, 1.0)

        recovered_revenue = round(expected_units * discounted_price, 2)
        salvage_loss_avoided = recovered_revenue
        total_potential_recovery += recovered_revenue

        rec_text = (
            f"Expiring in {days_left} day{'s' if days_left != 1 else ''}. "
            f"Apply a {discount_pct:.0f}% markdown from Rs. {orig_price:.0f} to Rs. {discounted_price:.0f}. "
            f"Expected to sell {expected_units} of {batch.current_quantity} {prod.unit}, recovering Rs. {recovered_revenue:,.0f}."
        )

        suggestions.append({
            "batch_id": batch.batch_id,
            "product_id": prod.product_id,
            "product_name": prod.name,
            "category": prod.category,
            "days_to_expiry": days_left,
            "current_quantity": batch.current_quantity,
            "unit": prod.unit,
            "original_price": orig_price,
            "suggested_discount_pct": discount_pct,
            "suggested_price": discounted_price,
            "expected_units_sold": expected_units,
            "projected_recovered_revenue": recovered_revenue,
            "salvage_loss_avoided": salvage_loss_avoided,
            "elasticity_score": elasticity,
            "recommendation_text": rec_text,
        })

    return {
        "total_batches_at_risk": len(suggestions),
        "total_potential_recovery_lkr": round(total_potential_recovery, 2),
        "suggestions": suggestions,
    }

def apply_batch_discount(
    db: Session,
    batch_id: str,
    discount_pct: float,
    discounted_price: float,
    recovered_estimate: float,
) -> Dict[str, Any]:
    """Applies a discount to an inventory batch, marking it as discounted and recording recovery."""
    batch = db.query(InventoryBatch).filter(InventoryBatch.batch_id == batch_id).first()
    if not batch:
        return {"success": False, "message": "Batch not found"}

    prod = db.query(Product).filter(Product.product_id == batch.product_id).first()
    orig_price = prod.unit_price if prod else discounted_price / (1 - (discount_pct / 100))

    # Record the discount
    discount_record = BatchDiscountRecord(
        batch_id=batch.batch_id,
        product_id=batch.product_id,
        original_price=orig_price,
        discount_pct=discount_pct,
        discounted_price=discounted_price,
        expected_units_sold=batch.current_quantity,
        recovered_revenue_lkr=recovered_estimate,
        salvage_loss_avoided_lkr=recovered_estimate,
        is_applied=True,
        applied_at=datetime.utcnow(),
    )
    db.add(discount_record)

    # Update batch status
    batch.status = "Discounted"
    db.commit()

    return {
        "success": True,
        "message": f"Successfully applied {discount_pct:.0f}% markdown to batch {batch_id}. Tagged for priority display.",
        "recovered_revenue_lkr": recovered_estimate,
    }
