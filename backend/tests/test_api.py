import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed.generate_sample_data import seed_database
from app.services.forecasting import DemandForecaster

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db, force=True)
    forecaster = DemandForecaster(db)
    forecaster.cache_all_forecasts()
    db.close()

def test_root_and_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert res_root.json()["app"] == "FoodSense API"

def test_auth_login():
    res = client.post("/auth/login", json={"email": "manager@foodsense.lk", "password": "demo1234"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["currency"] == "LKR"

def test_get_products():
    res = client.get("/products")
    assert res.status_code == 200
    prods = res.json()
    assert len(prods) >= 15
    assert any(p["product_id"] == "PRD-CKD-001" for p in prods)

def test_get_forecast():
    res = client.get("/forecast/PRD-CKD-001?horizon_days=14")
    assert res.status_code == 200
    data = res.json()
    assert data["product_id"] == "PRD-CKD-001"
    assert data["best_model"] is not None
    assert len(data["chart_data"]) > 0

def test_get_recommendations():
    res = client.get("/recommendations")
    assert res.status_code == 200
    data = res.json()
    assert data["total_products"] > 0
    assert len(data["recommendations"]) > 0

def test_get_kpis():
    res = client.get("/kpis?days_range=90")
    assert res.status_code == 200
    data = res.json()
    assert len(data["cards"]) == 6
    assert len(data["insights"]) > 0

def test_get_expiry_alerts():
    res = client.get("/alerts/expiry")
    assert res.status_code == 200
    data = res.json()
    assert "critical_count" in data
    assert "alerts" in data
