import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_auth_headers(email="manager@foodsense.lk", password="demo1234"):
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_sustainability_scorecard():
    headers = get_auth_headers()
    res = client.get("/sustainability/scorecard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "sustainability_score" in data
    assert data["sustainability_score"] >= 80
    assert "co2_avoided_kg" in data
    assert "equivalencies" in data
    assert len(data["badges"]) >= 4

def test_sustainability_pdf_export():
    headers = get_auth_headers()
    res = client.get("/sustainability/download-report", headers=headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000

def test_notifications_center():
    headers = get_auth_headers()
    res = client.get("/notifications", headers=headers)
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) >= 1

    # Mark first read
    first_id = notifs[0]["id"]
    res_read = client.post(f"/notifications/{first_id}/read", headers=headers)
    assert res_read.status_code == 200

    # Mark all read
    res_all = client.post("/notifications/read-all", headers=headers)
    assert res_all.status_code == 200

def test_outlets_leaderboard():
    headers = get_auth_headers()
    res = client.get("/outlets/leaderboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "enterprise_summary" in data
    assert data["enterprise_summary"]["total_outlets"] >= 3
    assert len(data["leaderboard"]) >= 3

def test_suppliers_and_price_history():
    headers = get_auth_headers()
    res = client.get("/suppliers", headers=headers)
    assert res.status_code == 200
    sups = res.json()
    assert len(sups) >= 3

    # Check price history for first supplier
    sup_id = sups[0]["supplier_id"]
    res_price = client.get(f"/suppliers/{sup_id}/prices", headers=headers)
    assert res_price.status_code == 200
    assert "price_history" in res_price.json()

def test_recipes_and_ingredient_explosion():
    headers = get_auth_headers()
    res = client.get("/recipes", headers=headers)
    assert res.status_code == 200
    recipes = res.json()
    assert len(recipes) >= 3

    # Explode ingredients for 7 days
    res_exp = client.get("/recipes/forecast-ingredients?forecast_days=7", headers=headers)
    assert res_exp.status_code == 200
    data = res_exp.json()
    assert "exploded_ingredients" in data
    assert len(data["exploded_ingredients"]) >= 5

def test_quick_waste_log():
    headers = get_auth_headers()
    res = client.post(
        "/data/quick-waste-log",
        json={
            "product_id": "PRD-BAK-002",
            "quantity_wasted": 1.5,
            "waste_reason": "Prep Trim",
            "notes": "End crusts",
        },
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["quantity_wasted"] == 1.5
    assert data["waste_cost_lkr"] > 0

def test_rbac_admin_and_staff_logins():
    # Admin login
    admin_headers = get_auth_headers("admin@foodsense.lk", "demo1234")
    assert "Bearer" in admin_headers["Authorization"]

    # Staff login
    staff_headers = get_auth_headers("staff@foodsense.lk", "demo1234")
    assert "Bearer" in staff_headers["Authorization"]
