from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.dtos import DashboardKPIResponse
from ..services.kpis import KPIService

router = APIRouter(prefix="/kpis", tags=["KPIs & Dashboard"])

@router.get("", response_model=DashboardKPIResponse)
def get_kpis(
    category: Optional[str] = Query(default=None),
    product_id: Optional[str] = Query(default=None),
    days_range: int = Query(default=90, ge=7, le=365),
    db: Session = Depends(get_db),
):
    """
    Returns executive KPI summary cards, time series trends, category distributions,
    heatmaps, before-vs-after comparison, and auto-generated data insights.
    """
    service = KPIService(db)
    return service.get_dashboard_kpis(category=category, product_id=product_id, days_range=days_range)
