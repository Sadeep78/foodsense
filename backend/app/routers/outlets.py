from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from ..database import get_db
from .auth import get_current_user, require_roles
from ..models import User
from ..models.entities import Outlet
from ..services.outlets import get_outlets_leaderboard, seed_outlets_if_empty

router = APIRouter(prefix="/outlets", tags=["Multi-Outlet Management"])

class OutletCreateRequest(BaseModel):
    outlet_id: str
    name: str
    city: str
    address: Optional[str] = None

class OutletResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    outlet_id: str
    name: str
    city: str
    address: Optional[str] = None
    is_active: bool

@router.get("", response_model=List[OutletResponse])
def get_all_outlets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all operational outlets/branches."""
    seed_outlets_if_empty(db)
    return db.query(Outlet).filter(Outlet.is_active == True).all()

@router.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns multi-branch performance leaderboard, rankings, and waste metrics."""
    return get_outlets_leaderboard(db)

@router.post("", response_model=OutletResponse)
def create_outlet(
    req: OutletCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"])),
):
    """Registers a new branch in the multi-outlet network."""
    existing = db.query(Outlet).filter(Outlet.outlet_id == req.outlet_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Outlet ID already registered")

    new_outlet = Outlet(
        outlet_id=req.outlet_id,
        name=req.name,
        city=req.city,
        address=req.address,
        is_active=True,
    )
    db.add(new_outlet)
    db.commit()
    db.refresh(new_outlet)
    return new_outlet
