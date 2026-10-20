from datetime import date, timedelta, datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models.entities import WasteGoal, InventoryBatch, DonationRecord, Sale

def seed_default_goals(db: Session):
    """Seeds default realistic sustainability targets for Sri Lankan businesses."""
    today = date.today()
    q_start = date(today.year, 1 if today.month <= 3 else (4 if today.month <= 6 else (7 if today.month <= 9 else 10)), 1)
    q_end = q_start + timedelta(days=90)
    year_end = date(today.year, 12, 31)

    defaults = [
        {
            "title": "Reduce Store Food Spoilage Below 5.5%",
            "description": "Cut inventory waste through demand-driven purchasing and dynamic markdowns across high-spoilage bakery and produce lines.",
            "goal_type": "reduce_waste_pct",
            "target_value": 5.5,
            "baseline_value": 11.2,
            "current_value": 7.4,
            "unit": "%",
            "start_date": q_start,
            "target_date": q_end,
            "status": "on_track",
        },
        {
            "title": "Save Rs. 250,000 in Waste Losses (Q1 Target)",
            "description": "Minimize spoilage costs compared to the previous quarter's unmanaged baseline.",
            "goal_type": "save_cost_lkr",
            "target_value": 250000.0,
            "baseline_value": 0.0,
            "current_value": 182400.0,
            "unit": "Rs.",
            "start_date": q_start,
            "target_date": q_end,
            "status": "on_track",
        },
        {
            "title": "Divert 1,000 Nutritious Meals to Colombo Charities",
            "description": "Redistribute near-expiry surplus food to registered soup kitchens and food banks.",
            "goal_type": "meals_donated",
            "target_value": 1000.0,
            "baseline_value": 0.0,
            "current_value": 640.0,
            "unit": "meals",
            "start_date": date(today.year, 1, 1),
            "target_date": year_end,
            "status": "on_track",
        },
        {
            "title": "Avoid 2.5 Tons (2,500 kg) CO2e Greenhouse Emissions",
            "description": "Divert organic waste from Karadiyana and Kerawalapitiya municipal landfills.",
            "goal_type": "co2_avoided",
            "target_value": 2500.0,
            "baseline_value": 0.0,
            "current_value": 1780.0,
            "unit": "kg CO2e",
            "start_date": date(today.year, 1, 1),
            "target_date": year_end,
            "status": "on_track",
        },
    ]

    for d in defaults:
        exists = db.query(WasteGoal).filter(WasteGoal.title == d["title"]).first()
        if not exists:
            goal = WasteGoal(**d)
            db.add(goal)
    db.commit()

def calculate_goal_progress(goal: WasteGoal, today: date) -> Dict[str, Any]:
    """Calculates progress %, status (on_track/at_risk/achieved), and projected completion date."""
    target = goal.target_value
    base = goal.baseline_value
    curr = goal.current_value

    if goal.goal_type == "reduce_waste_pct":
        # Decreasing goal: lower is better
        total_delta = base - target
        achieved_delta = base - curr
        progress_pct = (achieved_delta / total_delta * 100.0) if total_delta > 0 else 0.0
    else:
        # Increasing goal: higher is better
        total_delta = target - base
        achieved_delta = curr - base
        progress_pct = (achieved_delta / total_delta * 100.0) if total_delta > 0 else 0.0

    progress_pct = max(0.0, min(100.0, round(progress_pct, 1)))

    total_days = max(1, (goal.target_date - goal.start_date).days)
    days_elapsed = max(1, (today - goal.start_date).days)
    expected_pct = min(100.0, (days_elapsed / total_days) * 100.0)

    # Determine status
    if progress_pct >= 100.0:
        status = "achieved"
        projected_completion = today
    elif progress_pct >= expected_pct * 0.85:
        status = "on_track"
        # Estimate completion date from daily velocity
        daily_velocity = achieved_delta / days_elapsed if days_elapsed > 0 else 0
        if daily_velocity > 0:
            remaining_delta = total_delta - achieved_delta
            days_needed = int(remaining_delta / daily_velocity)
            projected_completion = today + timedelta(days=max(1, days_needed))
        else:
            projected_completion = goal.target_date
    else:
        status = "at_risk"
        daily_velocity = achieved_delta / days_elapsed if days_elapsed > 0 else 0
        if daily_velocity > 0:
            remaining_delta = total_delta - achieved_delta
            days_needed = int(remaining_delta / daily_velocity)
            projected_completion = today + timedelta(days=max(1, days_needed))
        else:
            projected_completion = goal.target_date + timedelta(days=30)

    return {
        "progress_pct": progress_pct,
        "status": status,
        "projected_completion_date": projected_completion,
    }

def get_all_goals(db: Session) -> List[Dict[str, Any]]:
    """Returns all waste goals with updated live progress calculations."""
    today = date.today()
    goals = db.query(WasteGoal).all()
    if not goals:
        seed_default_goals(db)
        goals = db.query(WasteGoal).all()

    # Dynamic updates from live DB records
    # 1. meals donated: query total donation records
    total_donation_qty = db.query(func.sum(DonationRecord.quantity)).scalar() or 0.0
    meals_from_donations = int(total_donation_qty / 0.4) if total_donation_qty > 0 else 0

    results = []
    for g in goals:
        if g.goal_type == "meals_donated" and meals_from_donations > 0:
            g.current_value = float(max(g.current_value, meals_from_donations))

        metrics = calculate_goal_progress(g, today)
        g.status = metrics["status"]
        g.projected_completion_date = metrics["projected_completion_date"]

        results.append({
            "id": g.id,
            "title": g.title,
            "description": g.description,
            "goal_type": g.goal_type,
            "target_value": g.target_value,
            "current_value": g.current_value,
            "baseline_value": g.baseline_value,
            "unit": g.unit,
            "start_date": g.start_date,
            "target_date": g.target_date,
            "status": g.status,
            "progress_pct": metrics["progress_pct"],
            "projected_completion_date": g.projected_completion_date,
        })

    db.commit()
    return results
