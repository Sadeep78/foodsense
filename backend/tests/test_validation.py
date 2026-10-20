import pytest
import pandas as pd
from app.services.validation import validate_sales_dataframe, validate_inventory_dataframe

def test_validate_sales_valid():
    df = pd.DataFrame([
        {
            "date": "2026-03-01",
            "product_id": "PRD-001",
            "product_name": "Test Bread",
            "category": "Bakery",
            "quantity_sold": 50,
            "unit_price": 200.0,
            "unit_cost": 120.0,
        }
    ])
    res = validate_sales_dataframe(df)
    assert res.valid is True
    assert res.error_count == 0
    assert res.valid_rows == 1

def test_validate_sales_missing_column():
    df = pd.DataFrame([{"date": "2026-03-01", "product_id": "PRD-001"}])
    res = validate_sales_dataframe(df)
    assert res.valid is False
    assert res.error_count > 0

def test_validate_sales_negative_quantity():
    df = pd.DataFrame([
        {
            "date": "2026-03-01",
            "product_id": "PRD-001",
            "product_name": "Test Bread",
            "category": "Bakery",
            "quantity_sold": -10,
            "unit_price": 200.0,
            "unit_cost": 120.0,
        }
    ])
    res = validate_sales_dataframe(df)
    assert res.valid is False
    assert any("negative" in issue.message for issue in res.issues)

def test_validate_inventory_expiry_before_received():
    df = pd.DataFrame([
        {
            "product_id": "PRD-001",
            "batch_id": "BAT-001",
            "quantity_received": 100,
            "received_date": "2026-03-10",
            "expiry_date": "2026-03-05",  # Invalid: before received date
            "quantity_wasted": 0,
            "waste_reason": "None",
        }
    ])
    res = validate_inventory_dataframe(df)
    assert res.valid is False
    assert any("precede" in issue.message for issue in res.issues)
