import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_insights_engine():
    # 1. Fetch insights
    res = client.get("/insights")
    assert res.status_code == 200
    data = res.json()
    assert "insights" in data
    assert "total_potential_savings" in data
    assert len(data["insights"]) > 0

    first_insight = data["insights"][0]
    insight_id = first_insight["id"]

    # 2. Apply insight
    res_apply = client.post(f"/insights/{insight_id}/apply")
    assert res_apply.status_code == 200
    assert res_apply.json()["success"] is True

    # 3. Dismiss insight
    res_dismiss = client.post(f"/insights/{insight_id}/dismiss")
    assert res_dismiss.status_code == 200
    assert res_dismiss.json()["success"] is True

def test_discounts_engine():
    # 1. Fetch discount suggestions
    res = client.get("/discounts/suggestions?alert_days=3")
    assert res.status_code == 200
    data = res.json()
    assert "suggestions" in data
    assert "total_potential_recovery_lkr" in data
    if len(data["suggestions"]) > 0:
        sug = data["suggestions"][0]
        assert sug["suggested_discount_pct"] in [20.0, 30.0, 40.0, 50.0]
        assert sug["suggested_price"] < sug["original_price"]

        # 2. Apply discount
        res_apply = client.post("/discounts/apply", json={
            "batch_id": sug["batch_id"],
            "discount_pct": sug["suggested_discount_pct"],
            "discounted_price": sug["suggested_price"],
            "recovered_estimate": sug["projected_recovered_revenue"],
        })
        assert res_apply.status_code == 200
        assert res_apply.json()["success"] is True

def test_donations_tracker():
    # 1. Fetch overview
    res = client.get("/donations")
    assert res.status_code == 200
    data = res.json()
    assert "total_meals_donated" in data
    assert "partners" in data
    assert len(data["partners"]) >= 4

    # 2. Log a new donation
    res_log = client.post("/donations", json={
        "product_id": "PRD-BAK-001",
        "product_name": "Kimbula Banis",
        "quantity": 25.0,
        "unit": "packs",
        "estimated_value_lkr": 11250.0,
        "recipient_ngo": "Sahana Community Kitchen Colombo",
        "receipt_note": "Evening surplus fresh donation test.",
    })
    assert res_log.status_code == 200
    assert res_log.json()["quantity"] == 25.0

    # 3. Partners directory
    res_partners = client.get("/donations/partners")
    assert res_partners.status_code == 200
    assert any("Sahana Community Kitchen" in p["name"] for p in res_partners.json())

def test_goals_tracker():
    # 1. List goals
    res = client.get("/goals")
    assert res.status_code == 200
    goals = res.json()
    assert len(goals) >= 4
    for g in goals:
        assert "progress_pct" in g
        assert g["status"] in ["on_track", "at_risk", "achieved", "behind"]

    # 2. Create goal
    res_create = client.post("/goals", json={
        "title": "Reduce Milk Packet Spoilage to 2%",
        "description": "Zero dairy spoilage target for Q4.",
        "goal_type": "reduce_waste_pct",
        "target_value": 2.0,
        "baseline_value": 8.0,
        "unit": "%",
        "start_date": "2026-10-01",
        "target_date": "2026-12-31",
    })
    assert res_create.status_code == 200
    new_id = res_create.json()["id"]

    # 3. Update goal
    res_update = client.put(f"/goals/{new_id}", json={
        "current_value": 4.5,
    })
    assert res_update.status_code == 200
    assert res_update.json()["current_value"] == 4.5
