from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.entities import WasteGoal
from ..schemas.dtos import WasteGoalCreate, WasteGoalUpdate, WasteGoalResponse
from ..services.goals import get_all_goals

router = APIRouter(prefix="/goals", tags=["Waste Reduction Goals & Targets"])

@router.get("", response_model=List[WasteGoalResponse])
def list_goals(db: Session = Depends(get_db)):
    """
    Returns all operational and sustainability goals with dynamic progress and projected completion.
    """
    return get_all_goals(db)

@router.post("", response_model=WasteGoalResponse)
def create_goal(payload: WasteGoalCreate, db: Session = Depends(get_db)):
    """Creates a new reduction or sustainability target."""
    goal = WasteGoal(
        title=payload.title,
        description=payload.description,
        goal_type=payload.goal_type,
        target_value=payload.target_value,
        baseline_value=payload.baseline_value,
        current_value=payload.baseline_value,
        unit=payload.unit,
        start_date=payload.start_date,
        target_date=payload.target_date,
        status="on_track",
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    # Refresh with progress calculation
    goals = get_all_goals(db)
    for g in goals:
        if g["id"] == goal.id:
            return g
    return goal

@router.put("/{goal_id}", response_model=WasteGoalResponse)
def update_goal(goal_id: int, payload: WasteGoalUpdate, db: Session = Depends(get_db)):
    """Updates an existing target's parameters or recorded progress."""
    goal = db.query(WasteGoal).filter(WasteGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    if payload.title is not None:
        goal.title = payload.title
    if payload.description is not None:
        goal.description = payload.description
    if payload.target_value is not None:
        goal.target_value = payload.target_value
    if payload.current_value is not None:
        goal.current_value = payload.current_value
    if payload.target_date is not None:
        goal.target_date = payload.target_date
    if payload.status is not None:
        goal.status = payload.status

    db.commit()
    goals = get_all_goals(db)
    for g in goals:
        if g["id"] == goal.id:
            return g
    return goal

@router.delete("/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    """Removes a goal."""
    goal = db.query(WasteGoal).filter(WasteGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"success": True, "message": "Goal removed successfully"}
