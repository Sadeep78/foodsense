from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from ..database import get_db
from ..models.entities import EventCalendar
from ..services.events import seed_events_and_weather, get_events_impact_analysis

router = APIRouter(prefix="/events", tags=["Weather & Event Regressors"])

class CustomEventCreate(BaseModel):
    title: str
    event_type: str = "local_promo"  # poya, festival, national_holiday, local_promo, weather_alert
    start_date: date
    end_date: date
    demand_lift_pct: float
    affected_categories: str = "All"

@router.get("")
def list_events(db: Session = Depends(get_db)):
    """Returns calendar of Sri Lankan holidays, Poya days, and weather regressors."""
    seed_events_and_weather(db)
    events = db.query(EventCalendar).order_by(EventCalendar.start_date.asc()).all()
    return events

@router.post("")
def create_custom_event(payload: CustomEventCreate, db: Session = Depends(get_db)):
    """Allows user to schedule a custom local promotion, festival buffets, or holiday surge."""
    event = EventCalendar(
        title=payload.title,
        event_type=payload.event_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        demand_lift_pct=payload.demand_lift_pct,
        affected_categories=payload.affected_categories,
        is_custom=True,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/impact-analysis")
def get_impact_analysis(db: Session = Depends(get_db)):
    """
    Returns comparative forecast accuracy with vs without event modeling,
    plus demand uplift charts by event category.
    """
    return get_events_impact_analysis(db)
