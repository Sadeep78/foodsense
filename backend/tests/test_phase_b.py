import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_events_and_weather():
    # 1. Fetch events
    res = client.get("/events")
    assert res.status_code == 200
    events = res.json()
    assert len(events) >= 10
    assert any("Avurudu" in e["title"] or "Poya" in e["title"] for e in events)

    # 2. Add custom event
    res_custom = client.post("/events", json={
        "title": "Galle Literary Food Festival",
        "event_type": "festival",
        "start_date": "2026-11-20",
        "end_date": "2026-11-22",
        "demand_lift_pct": 35.0,
        "affected_categories": "Cooked Meals, Bakery",
    })
    assert res_custom.status_code == 200
    assert res_custom.json()["is_custom"] is True

    # 3. Impact analysis
    res_impact = client.get("/events/impact-analysis")
    assert res_impact.status_code == 200
    data = res_impact.json()
    assert data["accuracy_improvement_pct"] > 5.0
    assert len(data["uplift_by_event"]) > 0
    assert len(data["model_comparison"]) == 2

def test_forecast_explainability():
    # Fetch explainability for a known product
    res = client.get("/forecast/explainability/PRD-CKD-001")
    assert res.status_code == 200
    data = res.json()
    assert "components_summary" in data
    assert "waterfall_breakdown" in data
    assert len(data["waterfall_breakdown"]) == 7
    assert "directional_bias" in data
    assert "benchmark_models" in data
    assert len(data["benchmark_models"]) == 4

def test_profit_margin_analysis():
    # Fetch margins
    res = client.get("/margins")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert data["summary"]["gross_margin_pct"] > 0
    assert "sku_analysis" in data
    assert len(data["sku_analysis"]) > 0
    assert "quadrant_counts" in data
    assert data["quadrant_counts"]["stars"] >= 0

    first_sku = data["sku_analysis"][0]
    assert "quadrant" in first_sku
    assert "recommended_action" in first_sku
    assert "net_margin_pct" in first_sku
