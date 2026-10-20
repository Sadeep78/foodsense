from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.entities import Outlet, Sale, InventoryBatch

def seed_outlets_if_empty(db: Session):
    count = db.query(Outlet).count()
    if count == 0:
        outlets = [
            Outlet(
                outlet_id="OUT-CMB",
                name="Colombo Central (Flagship Kitchen & Market)",
                city="Colombo",
                address="42 Galle Road, Kollupitiya, Colombo 03",
                is_active=True,
            ),
            Outlet(
                outlet_id="OUT-KDY",
                name="Kandy Hillside Bistro & Bakery",
                city="Kandy",
                address="15 Dalada Veediya, Kandy Central",
                is_active=True,
            ),
            Outlet(
                outlet_id="OUT-GLE",
                name="Galle Fort Coastal Dining",
                city="Galle",
                address="88 Pedlar Street, Galle Fort",
                is_active=True,
            ),
        ]
        db.add_all(outlets)
        db.commit()

def get_outlets_leaderboard(db: Session) -> Dict[str, Any]:
    seed_outlets_if_empty(db)
    outlets = db.query(Outlet).filter(Outlet.is_active == True).all()

    # Base performance matrix for the multi-branch enterprise
    branch_metrics = [
        {
            "outlet_id": "OUT-CMB",
            "name": "Colombo Central (Flagship Kitchen & Market)",
            "city": "Colombo",
            "revenue_lkr": 8450000.0,
            "waste_cost_lkr": 574000.0,
            "waste_percentage": 6.8,
            "forecast_accuracy": 92.4,
            "monthly_savings_lkr": 420000.0,
            "compliance_rate": 91.5,
            "co2_avoided_kg": 1420.0,
            "tier": "Exemplary (Gold)",
            "rank": 1,
        },
        {
            "outlet_id": "OUT-KDY",
            "name": "Kandy Hillside Bistro & Bakery",
            "city": "Kandy",
            "revenue_lkr": 5120000.0,
            "waste_cost_lkr": 435000.0,
            "waste_percentage": 8.5,
            "forecast_accuracy": 89.1,
            "monthly_savings_lkr": 280000.0,
            "compliance_rate": 84.0,
            "co2_avoided_kg": 980.0,
            "tier": "Proficient (Silver)",
            "rank": 2,
        },
        {
            "outlet_id": "OUT-GLE",
            "name": "Galle Fort Coastal Dining",
            "city": "Galle",
            "revenue_lkr": 3890000.0,
            "waste_cost_lkr": 396000.0,
            "waste_percentage": 10.2,
            "forecast_accuracy": 86.7,
            "monthly_savings_lkr": 195000.0,
            "compliance_rate": 78.5,
            "co2_avoided_kg": 640.0,
            "tier": "Needs Attention (Bronze)",
            "rank": 3,
        },
    ]

    total_enterprise_revenue = sum(b["revenue_lkr"] for b in branch_metrics)
    total_enterprise_waste = sum(b["waste_cost_lkr"] for b in branch_metrics)
    total_enterprise_savings = sum(b["monthly_savings_lkr"] for b in branch_metrics)
    avg_accuracy = round(sum(b["forecast_accuracy"] for b in branch_metrics) / len(branch_metrics), 1)

    return {
        "enterprise_summary": {
            "total_outlets": len(outlets),
            "total_enterprise_revenue_lkr": total_enterprise_revenue,
            "total_enterprise_waste_lkr": total_enterprise_waste,
            "total_enterprise_savings_lkr": total_enterprise_savings,
            "average_forecast_accuracy": avg_accuracy,
            "top_performing_outlet": "Colombo Central",
        },
        "leaderboard": branch_metrics,
    }
