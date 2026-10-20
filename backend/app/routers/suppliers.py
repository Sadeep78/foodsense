from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from .auth import get_current_user
from ..models import User
from ..models.entities import Supplier
from ..services.suppliers import get_suppliers_directory, get_supplier_price_trend, seed_suppliers_if_empty

router = APIRouter(prefix="/suppliers", tags=["Supplier Management"])

class SupplierCreateRequest(BaseModel):
    supplier_id: str
    name: str
    category: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    lead_time_days: int = 2
    on_time_delivery_pct: float = 95.0
    quality_score: float = 9.0

@router.get("")
def get_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full supplier directory with performance and price spike indicators."""
    seed_suppliers_if_empty(db)
    return get_suppliers_directory(db)

@router.get("/{supplier_id}/prices")
def get_prices(
    supplier_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve historical procurement price trajectory and commodity trends for a supplier."""
    seed_suppliers_if_empty(db)
    return get_supplier_price_trend(supplier_id, db)

@router.post("")
def create_supplier(
    req: SupplierCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a new vendor in the supplier directory."""
    existing = db.query(Supplier).filter(Supplier.supplier_id == req.supplier_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Supplier ID already registered")

    new_sup = Supplier(
        supplier_id=req.supplier_id,
        name=req.name,
        category=req.category,
        contact_name=req.contact_name,
        phone=req.phone,
        email=req.email,
        lead_time_days=req.lead_time_days,
        on_time_delivery_pct=req.on_time_delivery_pct,
        quality_score=req.quality_score,
        is_active=True,
    )
    db.add(new_sup)
    db.commit()
    db.refresh(new_sup)
    return new_sup
