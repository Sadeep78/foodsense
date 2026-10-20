import math
from datetime import date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from ..models import Product, InventoryBatch, SystemSettings
from ..schemas.dtos import RecommendationItem, RecommendationResponse
from .forecasting import DemandForecaster

class RecommendationEngine:
    def __init__(self, db: Session):
        self.db = db
        self.forecaster = DemandForecaster(db)

    def generate_recommendations(self) -> RecommendationResponse:
        """
        Calculates smart ordering recommendations for all active products:
        Order Qty = Forecasted Demand (Lead Time) + Safety Stock - Usable Stock (rounded to pack size).
        """
        today = date.today()
        products = self.db.query(Product).filter(Product.is_active == True).all()
        settings = self.db.query(SystemSettings).first()
        currency = settings.currency if settings else "LKR"

        recommendations: List[RecommendationItem] = []
        urgent_count = 0
        total_spend = 0.0

        for prod in products:
            lead_time = max(1, prod.lead_time_days)
            safety_pct = prod.safety_stock_pct if prod.safety_stock_pct is not None else 15.0
            pack_size = max(1, prod.pack_size)

            # Get forecast demand over lead time (check cache first for speed)
            try:
                cached_points = (
                    self.db.query(ForecastCache.forecasted_demand)
                    .filter(
                        ForecastCache.product_id == prod.product_id,
                        ForecastCache.horizon_days == 7,
                        ForecastCache.is_best_model == True,
                    )
                    .limit(lead_time)
                    .all()
                )
                if cached_points:
                    lead_time_demand = sum(cp[0] for cp in cached_points)
                else:
                    forecast_res = self.forecaster.generate_product_forecast(prod.product_id, horizon_days=max(lead_time, 7))
                    future_points = [p for p in forecast_res.chart_data if p.forecast is not None]
                    lead_time_points = future_points[:lead_time]
                    lead_time_demand = sum(p.forecast for p in lead_time_points if p.forecast is not None)
            except Exception:
                lead_time_demand = float(lead_time * 20.0)

            # Calculate safety stock
            safety_stock_qty = lead_time_demand * (safety_pct / 100.0)

            # Retrieve active batches
            batches = (
                self.db.query(InventoryBatch)
                .filter(
                    InventoryBatch.product_id == prod.product_id,
                    InventoryBatch.status == "Active",
                    InventoryBatch.current_quantity > 0,
                )
                .all()
            )

            # Usable stock vs expiring stock
            # Usable stock: batches that do NOT expire before delivery arrives
            cutoff_date = today + timedelta(days=lead_time)
            usable_stock = 0.0
            expiring_soon_stock = 0.0

            for b in batches:
                if b.expiry_date <= cutoff_date:
                    expiring_soon_stock += b.current_quantity
                else:
                    usable_stock += b.current_quantity

            # Net requirement calculation
            gross_needed = lead_time_demand + safety_stock_qty
            net_deficit = gross_needed - usable_stock

            if net_deficit <= 0:
                recommended_order = 0
                priority = "Skip"
                reason = (
                    f"Adequate stock ({usable_stock:.1f} {prod.unit}) covers the next {lead_time} days demand "
                    f"({lead_time_demand:.1f}) plus safety buffer ({safety_stock_qty:.1f}). No purchase required."
                )
            else:
                # Round up to whole pack sizes
                recommended_order = int(math.ceil(net_deficit / pack_size) * pack_size)
                
                # Priority categorization
                if usable_stock <= (safety_stock_qty * 0.5) or usable_stock < (lead_time_demand * 0.3):
                    priority = "Urgent"
                    urgent_count += 1
                    reason = (
                        f"Stockout risk! Usable inventory ({usable_stock:.1f} {prod.unit}) is dangerously low compared "
                        f"to {lead_time}-day expected demand ({lead_time_demand:.1f}). Order {recommended_order} {prod.unit} immediately."
                    )
                else:
                    priority = "Normal"
                    reason = (
                        f"Standard replenishment. Covers {lead_time}d demand ({lead_time_demand:.1f}) + safety stock "
                        f"({safety_stock_qty:.1f}) less usable stock ({usable_stock:.1f}), rounded to pack size {pack_size}."
                    )

            estimated_cost = round(recommended_order * prod.unit_cost, 2)
            total_spend += estimated_cost

            recommendations.append(
                RecommendationItem(
                    product_id=prod.product_id,
                    product_name=prod.name,
                    category=prod.category,
                    unit=prod.unit,
                    current_usable_stock=round(usable_stock, 1),
                    expiring_soon_stock=round(expiring_soon_stock, 1),
                    lead_time_days=lead_time,
                    safety_stock_pct=round(safety_pct, 1),
                    pack_size=pack_size,
                    forecasted_demand_lead_time=round(lead_time_demand, 1),
                    safety_stock_qty=round(safety_stock_qty, 1),
                    gross_requirement=round(gross_needed, 1),
                    recommended_order=recommended_order,
                    unit_cost=prod.unit_cost,
                    estimated_order_cost=estimated_cost,
                    priority=priority,
                    reason=reason,
                )
            )

        # Sort recommendations: Urgent first, then Normal, then Skip
        priority_order = {"Urgent": 0, "Normal": 1, "Skip": 2}
        recommendations.sort(key=lambda r: (priority_order.get(r.priority, 3), -r.estimated_order_cost))

        return RecommendationResponse(
            total_products=len(products),
            urgent_orders_count=urgent_count,
            total_estimated_spend=round(total_spend, 2),
            currency=currency,
            recommendations=recommendations,
        )
