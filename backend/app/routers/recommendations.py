import io
import csv
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.dtos import RecommendationResponse
from ..services.recommendations import RecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["Ordering Recommendations"])

@router.get("", response_model=RecommendationResponse)
def get_recommendations(db: Session = Depends(get_db)):
    """
    Computes real-time smart replenishment orders based on demand forecasts,
    safety stock settings, and usable non-expired inventory.
    """
    engine = RecommendationEngine(db)
    return engine.generate_recommendations()

@router.get("/export")
def export_recommendations_csv(db: Session = Depends(get_db)):
    """
    Exports recommended purchase orders as a downloadable CSV.
    """
    engine = RecommendationEngine(db)
    recs = engine.generate_recommendations()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Product ID",
        "Product Name",
        "Category",
        "Unit",
        "Usable Stock",
        "Expiring Soon Stock",
        "Lead Time (Days)",
        "Safety Stock %",
        "Pack Size",
        "Lead Time Demand",
        "Recommended Order",
        "Estimated Cost (LKR)",
        "Priority",
        "Explanation",
    ])

    for r in recs.recommendations:
        writer.writerow([
            r.product_id,
            r.product_name,
            r.category,
            r.unit,
            r.current_usable_stock,
            r.expiring_soon_stock,
            r.lead_time_days,
            r.safety_stock_pct,
            r.pack_size,
            r.forecasted_demand_lead_time,
            r.recommended_order,
            r.estimated_order_cost,
            r.priority,
            r.reason,
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=foodsense_recommended_orders.csv"},
    )
