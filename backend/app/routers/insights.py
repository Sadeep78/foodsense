from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from ..database import get_db
from ..models.entities import Insight
from ..schemas.dtos import InsightResponse, InsightSummaryResponse
from ..services.insights import generate_insights_from_data, apply_insight_action, dismiss_insight_action

router = APIRouter(prefix="/insights", tags=["Smart Insights Engine"])

@router.get("", response_model=InsightSummaryResponse)
def get_insights(
    include_dismissed: bool = False,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns auto-generated smart operational insights ranked by potential savings,
    including severity distribution.
    """
    # Trigger dynamic generation/analysis
    generate_insights_from_data(db)

    query = db.query(Insight)
    if not include_dismissed:
        query = query.filter(Insight.is_dismissed == False)
    if severity and severity.lower() != "all":
        query = query.filter(Insight.severity == severity.lower())

    all_insights = query.order_by(
        Insight.is_applied.asc(),
        Insight.severity == "critical",
        Insight.potential_savings_lkr.desc()
    ).all()

    total_savings = sum(i.potential_savings_lkr for i in all_insights if not i.is_applied)
    crit = sum(1 for i in all_insights if i.severity == "critical")
    warn = sum(1 for i in all_insights if i.severity == "warning")
    info = sum(1 for i in all_insights if i.severity == "info")

    return {
        "total_potential_savings": round(total_savings, 2),
        "critical_count": crit,
        "warning_count": warn,
        "info_count": info,
        "insights": all_insights,
    }

@router.post("/{insight_id}/apply")
def apply_insight(insight_id: int, db: Session = Depends(get_db)):
    """Applies the recommended operational adjustment for this insight."""
    res = apply_insight_action(db, insight_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res

@router.post("/{insight_id}/dismiss")
def dismiss_insight(insight_id: int, db: Session = Depends(get_db)):
    """Dismisses an insight from active dashboard views."""
    res = dismiss_insight_action(db, insight_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res
