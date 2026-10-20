from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import SystemSettings, BusinessProfile, User
from ..schemas.dtos import SettingsDTO, SettingsUpdate
from .auth import get_current_user, require_roles

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SettingsDTO)
def get_system_settings(db: Session = Depends(get_db)):
    """
    Returns current business profile, currency, inventory parameters, and environmental factors.
    """
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    profile = db.query(BusinessProfile).first()
    if not profile:
        user = db.query(User).first()
        profile = BusinessProfile(user_id=user.id if user else 1)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return SettingsDTO(
        business_name=profile.business_name,
        business_type=profile.business_type,
        currency=settings.currency,
        outlet_name=profile.outlet_name,
        address=profile.address,
        default_safety_stock_pct=settings.default_safety_stock_pct,
        default_lead_time_days=settings.default_lead_time_days,
        alert_days_urgent=settings.alert_days_urgent,
        alert_days_warning=settings.alert_days_warning,
        alert_days_notice=settings.alert_days_notice,
        co2_factor_food_waste=settings.co2_factor_food_waste,
    )

@router.put("", response_model=SettingsDTO)
def update_system_settings(
    req: SettingsUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["Admin", "Manager"])),
):
    """
    Updates platform configuration, business profile, safety stocks and thresholds.
    """
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)

    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        profile = BusinessProfile(user_id=user.id)
        db.add(profile)

    if req.business_name is not None:
        profile.business_name = req.business_name
    if req.business_type is not None:
        profile.business_type = req.business_type
    if req.currency is not None:
        settings.currency = req.currency
        profile.currency = req.currency
    if req.outlet_name is not None:
        profile.outlet_name = req.outlet_name
    if req.address is not None:
        profile.address = req.address

    if req.default_safety_stock_pct is not None:
        settings.default_safety_stock_pct = req.default_safety_stock_pct
    if req.default_lead_time_days is not None:
        settings.default_lead_time_days = req.default_lead_time_days
    if req.alert_days_urgent is not None:
        settings.alert_days_urgent = req.alert_days_urgent
    if req.alert_days_warning is not None:
        settings.alert_days_warning = req.alert_days_warning
    if req.alert_days_notice is not None:
        settings.alert_days_notice = req.alert_days_notice
    if req.co2_factor_food_waste is not None:
        settings.co2_factor_food_waste = req.co2_factor_food_waste

    db.commit()
    db.refresh(settings)
    db.refresh(profile)

    return SettingsDTO(
        business_name=profile.business_name,
        business_type=profile.business_type,
        currency=settings.currency,
        outlet_name=profile.outlet_name,
        address=profile.address,
        default_safety_stock_pct=settings.default_safety_stock_pct,
        default_lead_time_days=settings.default_lead_time_days,
        alert_days_urgent=settings.alert_days_urgent,
        alert_days_warning=settings.alert_days_warning,
        alert_days_notice=settings.alert_days_notice,
        co2_factor_food_waste=settings.co2_factor_food_waste,
    )
