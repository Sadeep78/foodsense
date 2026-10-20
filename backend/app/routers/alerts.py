from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import InventoryBatch, Product, SystemSettings
from ..schemas.dtos import ExpiryAlertItem, ExpiryAlertSummary

router = APIRouter(prefix="/alerts", tags=["Expiry Alerts"])

@router.get("/expiry", response_model=ExpiryAlertSummary)
def get_expiry_alerts(db: Session = Depends(get_db)):
    """
    Returns batches expiring within 7 days, color-coded by urgency:
    - Critical (<= 1 day): Red
    - Warning (2 to 3 days): Orange
    - Notice (4 to 7 days): Yellow
    """
    today = date.today()
    max_expiry_date = today + timedelta(days=7)

    settings = db.query(SystemSettings).first()
    currency = settings.currency if settings else "LKR"

    batches = (
        db.query(InventoryBatch)
        .filter(
            InventoryBatch.status == "Active",
            InventoryBatch.current_quantity > 0,
            InventoryBatch.expiry_date >= today,
            InventoryBatch.expiry_date <= max_expiry_date,
        )
        .order_by(InventoryBatch.expiry_date.asc())
        .all()
    )

    alert_items: List[ExpiryAlertItem] = []
    critical_count = 0
    warning_count = 0
    notice_count = 0
    total_val_at_risk = 0.0

    # Pre-fetch products
    products_by_id = {p.product_id: p for p in db.query(Product).all()}

    for b in batches:
        product = products_by_id.get(b.product_id)
        if not product:
            continue

        days_left = (b.expiry_date - today).days
        val_at_risk = round(b.current_quantity * product.unit_cost, 2)
        total_val_at_risk += val_at_risk

        if days_left <= 1:
            urgency = "critical"  # Red
            critical_count += 1
            actions = [
                "Apply immediate 50% evening discount",
                "Utilize in executive chef lunch specials",
                "Flag for local food bank donation (Sahana)",
            ]
        elif days_left <= 3:
            urgency = "warning"  # Orange
            warning_count += 1
            actions = [
                "Apply 25% promotional flash discount",
                "Enforce strict FIFO display placement",
                "Bundle combo with fast-moving pantry goods",
            ]
        else:
            urgency = "notice"  # Yellow
            notice_count += 1
            actions = [
                "Monitor daily sales velocity closely",
                "Delay upcoming replenishment shipment",
                "Inspect cold storage temperatures",
            ]

        alert_items.append(
            ExpiryAlertItem(
                id=b.id,
                batch_id=b.batch_id,
                product_id=b.product_id,
                product_name=product.name,
                category=product.category,
                unit=product.unit,
                current_quantity=round(b.current_quantity, 1),
                expiry_date=b.expiry_date.strftime("%Y-%m-%d"),
                days_until_expiry=max(0, days_left),
                urgency=urgency,
                unit_cost=product.unit_cost,
                value_at_risk=val_at_risk,
                suggested_actions=actions,
            )
        )

    # Sort critical first, then warning, then notice
    urgency_prio = {"critical": 0, "warning": 1, "notice": 2}
    alert_items.sort(key=lambda x: (urgency_prio.get(x.urgency, 3), -x.value_at_risk))

    return ExpiryAlertSummary(
        critical_count=critical_count,
        warning_count=warning_count,
        notice_count=notice_count,
        total_value_at_risk=round(total_val_at_risk, 2),
        currency=currency,
        alerts=alert_items,
    )
