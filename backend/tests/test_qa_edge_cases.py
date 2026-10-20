import pytest
from fastapi.testclient import TestClient
from datetime import date, timedelta
from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal
from backend.app.models import Product, Sale, User
from backend.app.services.forecasting import DemandForecaster
from backend.app.services.kpis import KPIService
from backend.app.services.validation import parse_file_to_dataframe, validate_sales_dataframe, validate_inventory_dataframe
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

client = TestClient(app)

def get_auth_token(email="manager@foodsense.lk", password="demo1234"):
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_rbac_settings_protection():
    """Verify Kitchen Staff cannot modify system settings (403 Forbidden)."""
    staff_token = get_auth_token(email="staff@foodsense.lk", password="demo1234")
    res = client.put(
        "/settings",
        json={"currency": "USD"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert res.status_code == 403
    assert "forbidden" in res.json()["detail"].lower()

    # Admin should be allowed
    admin_token = get_auth_token(email="admin@foodsense.lk", password="demo1234")
    res_admin = client.put(
        "/settings",
        json={"currency": "LKR"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin.status_code == 200

def test_rbac_outlet_creation_protection():
    """Verify non-admin cannot create new branches."""
    manager_token = get_auth_token(email="manager@foodsense.lk", password="demo1234")
    res = client.post(
        "/outlets",
        json={"outlet_id": "TEST_OUT", "name": "Test Branch", "city": "Jaffna"},
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert res.status_code == 403

def test_empty_database_graceful_handling():
    """Verify empty database returns clean zeroed dashboard without crash."""
    mem_engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=mem_engine)
    MemSession = sessionmaker(bind=mem_engine)
    db = MemSession()
    try:
        kpi_service = KPIService(db)
        dashboard = kpi_service.get_dashboard_kpis(days_range=30)
        assert len(dashboard.cards) == 6
        for card in dashboard.cards:
            assert card.numeric_value is not None
    finally:
        db.close()

def test_sparse_history_forecasting():
    """Verify SKU with <21 days history gracefully reverts to Moving Average."""
    db = SessionLocal()
    sparse_id = "PRD-SPARSE-PYTEST"
    try:
        # Create temporary sparse product
        prod = Product(
            product_id=sparse_id,
            name="Sparse Test Dish",
            category="Cooked Meals",
            unit="pack",
            unit_price=500.0,
            unit_cost=300.0,
            shelf_life_days=2,
            lead_time_days=1,
            safety_stock_pct=15.0,
            pack_size=5,
        )
        db.add(prod)
        db.flush()

        # Add only 5 days of history
        base = date.today() - timedelta(days=5)
        for i in range(5):
            db.add(Sale(
                date=base + timedelta(days=i),
                product_id=sparse_id,
                product_name="Sparse Test Dish",
                category="Cooked Meals",
                quantity_sold=10.0 + i,
                unit_price=500.0,
                unit_cost=300.0,
            ))
        db.commit()

        forecaster = DemandForecaster(db)
        resp = forecaster.generate_product_forecast(sparse_id, horizon_days=7)
        assert resp.has_sparse_history == True
        assert resp.warning is not None
        assert "Moving Average" in resp.best_model

    finally:
        db.query(Sale).filter(Sale.product_id == sparse_id).delete()
        db.query(Product).filter(Product.product_id == sparse_id).delete()
        db.commit()
        db.close()

def test_csv_validation_negative_and_inverted():
    """Test validation rejection of negative quantities and inverted dates."""
    bad_sales = """date,product_id,product_name,category,quantity_sold,unit_price,unit_cost
2026-03-01,PRD-CKD-001,Chicken Rice & Curry,Cooked Meals,-5,750,450"""
    df_sales = parse_file_to_dataframe(bad_sales.encode("utf-8"), "sales.csv")
    res_sales = validate_sales_dataframe(df_sales)
    assert not res_sales.valid
    assert any("negative" in str(issue.message).lower() for issue in res_sales.issues)

    bad_inv = """product_id,batch_id,quantity_received,received_date,expiry_date,quantity_wasted,waste_reason
PRD-CKD-001,BAT-01,10,2026-04-10,2026-04-05,0,None"""
    df_inv = parse_file_to_dataframe(bad_inv.encode("utf-8"), "inv.csv")
    res_inv = validate_inventory_dataframe(df_inv)
    assert not res_inv.valid
    assert any("expiry" in str(issue.message).lower() for issue in res_inv.issues)
