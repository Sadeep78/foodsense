from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.dtos import DiscountSuggestionResponse, ApplyDiscountRequest
from ..services.discounts import calculate_discount_suggestions, apply_batch_discount

router = APIRouter(prefix="/discounts", tags=["Dynamic Markdown & Discounts"])

@router.get("/suggestions", response_model=DiscountSuggestionResponse)
def get_discount_suggestions(
    alert_days: int = Query(default=3, ge=1, le=14),
    db: Session = Depends(get_db)
):
    """
    Computes optimal price markdowns for near-expiry inventory batches
    to maximize revenue recovery before spoilage.
    """
    data = calculate_discount_suggestions(db, alert_threshold_days=alert_days)
    return data

@router.post("/apply")
def apply_discount(payload: ApplyDiscountRequest, db: Session = Depends(get_db)):
    """
    Applies the recommended markdown discount to a specific inventory batch.
    """
    res = apply_batch_discount(
        db,
        batch_id=payload.batch_id,
        discount_pct=payload.discount_pct,
        discounted_price=payload.discounted_price,
        recovered_estimate=payload.recovered_estimate,
    )
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res
