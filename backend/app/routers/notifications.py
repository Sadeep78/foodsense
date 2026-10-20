from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from ..database import get_db
from .auth import get_current_user
from ..models import User
from ..models.entities import NotificationItem

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    category: str
    link_url: Optional[str] = None
    is_read: bool
    created_at: datetime

def seed_notifications_if_empty(db: Session):
    count = db.query(NotificationItem).count()
    if count == 0:
        sample_notifs = [
            NotificationItem(
                title="Critical Expiry Warning",
                message="3.5 kg of Roast Paan expires in 1 day (Rs. 1,225 at risk). Review discount or charity donation now.",
                category="Alert",
                link_url="/alerts",
                is_read=False,
            ),
            NotificationItem(
                title="Weekend Demand Spike Forecasted",
                message="Chicken curry portion demand projected to increase +22% due to upcoming Poya long weekend.",
                category="Insight",
                link_url="/insights",
                is_read=False,
            ),
            NotificationItem(
                title="Waste Target On Track",
                message="Monthly Waste Reduction goal is currently at 7.4% (target <8.0%). Keep current order safety stocks.",
                category="Goal",
                link_url="/goals",
                is_read=False,
            ),
            NotificationItem(
                title="Automated Model Retraining Completed",
                message="Holt-Winters seasonal models retrained with +7.8% accuracy uplift using event & weather regressors.",
                category="System",
                link_url="/forecast",
                is_read=True,
            ),
            NotificationItem(
                title="Donation Logged Successfully",
                message="15.0 kg surplus produce logged for Sahana Kitchen charity redistribution.",
                category="Alert",
                link_url="/donations",
                is_read=True,
            ),
        ]
        db.add_all(sample_notifs)
        db.commit()

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve notifications, ordered newest first."""
    seed_notifications_if_empty(db)
    items = db.query(NotificationItem).order_by(NotificationItem.created_at.desc()).all()
    return items

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the total number of unread notifications."""
    seed_notifications_if_empty(db)
    count = db.query(NotificationItem).filter(NotificationItem.is_read == False).count()
    return {"unread_count": count}

@router.post("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a single notification as read."""
    item = db.query(NotificationItem).filter(NotificationItem.id == notification_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found")
    item.is_read = True
    db.commit()
    return {"message": "Notification marked as read", "id": notification_id}

@router.post("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read."""
    db.query(NotificationItem).update({NotificationItem.is_read: True})
    db.commit()
    return {"message": "All notifications marked as read"}
