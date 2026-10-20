from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..services.margins import get_profit_margin_analysis

router = APIRouter(prefix="/margins", tags=["Profit & Margin Analysis"])

@router.get("")
def get_margins(
    category: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Returns SKU and category level profitability analysis, waste erosion impact,
    and 4-quadrant scatter positioning.
    """
    return get_profit_margin_analysis(db, category=category)
