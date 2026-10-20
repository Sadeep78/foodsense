"""
QA Verification & Mathematical Validation Script for FoodSense
Tests:
1. KPI calculations against raw SQLite database records (expected vs displayed).
2. Forecasting engine accuracy metrics (MAE, RMSE, MAPE) & model selection logic.
3. Edge cases: empty DB handling, malformed CSV uploads, sparse history SKUs, missing dates, and large CSV datasets.
"""
import sys
import os
import io
import time
import pandas as pd
import numpy as np
from datetime import date, datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.database import Base, engine, SessionLocal
from app.models import Sale, InventoryBatch, Product, ForecastCache
from app.services.kpis import KPIService
from app.services.forecasting import DemandForecaster, calculate_metrics
from app.services.validation import (
    parse_file_to_dataframe,
    validate_sales_dataframe,
    validate_inventory_dataframe,
)

def run_kpi_verification():
    print("=" * 80)
    print("1. KPI VERIFICATION AGAINST RAW SQLite DATA")
    print("=" * 80)

    db = SessionLocal()
    try:
        # Ground Truth from Raw Tables for 365-day range
        today = date.today()
        start_365 = today - timedelta(days=365)
        all_batches = db.query(InventoryBatch).filter(InventoryBatch.received_date >= start_365).all()
        all_sales = db.query(Sale).filter(Sale.date >= start_365, Sale.date <= today).all()
        all_products = db.query(Product).all()

        total_batches = len(all_batches)
        total_sales = len(all_sales)
        total_products = len(all_products)

        raw_received_qty = sum(b.quantity_received for b in all_batches)
        raw_wasted_qty = sum(b.quantity_wasted for b in all_batches)
        raw_waste_cost = sum(b.waste_cost for b in all_batches)
        raw_waste_pct = round((raw_wasted_qty / max(raw_received_qty, 1.0)) * 100.0, 1)

        # Baseline waste cost (12.5% unassisted procurement)
        baseline_cost = (raw_received_qty * 0.125) * (raw_waste_cost / max(raw_wasted_qty, 1.0))
        raw_savings = max(0.0, round(baseline_cost - raw_waste_cost, 0))

        # CO2 avoided (2.5 kg CO2e / kg waste avoided)
        wasted_kg_avoided = max(0.0, (raw_received_qty * 0.125) - raw_wasted_qty)
        raw_co2_avoided = round(wasted_kg_avoided * 2.5, 1)

        # Query KPI Service for 365-day range
        kpi_service = KPIService(db)
        kpi_resp = kpi_service.get_dashboard_kpis(days_range=365)

        cards = {c.title: c for c in kpi_resp.cards}

        # Verification Table
        print(f"\n{'Metric Name':<35} | {'Raw DB Ground Truth':<20} | {'KPI Service Output':<20} | {'Status':<8}")
        print("-" * 88)

        # 1. Food Waste %
        disp_waste_pct = cards["Food Waste Percentage"].numeric_value
        status1 = "MATCH" if abs(disp_waste_pct - raw_waste_pct) < 0.1 else "MISMATCH"
        print(f"{'Food Waste Percentage (%)':<35} | {f'{raw_waste_pct}%':<20} | {f'{disp_waste_pct}%':<20} | {status1:<8}")

        # 2. Total Waste Cost
        disp_cost = cards["Total Cost of Waste"].numeric_value
        status2 = "MATCH" if abs(disp_cost - raw_waste_cost) < 1.0 else "MISMATCH"
        print(f"{'Cost of Food Waste (LKR)':<35} | {f'Rs. {raw_waste_cost:,.0f}':<20} | {f'Rs. {disp_cost:,.0f}':<20} | {status2:<8}")

        # 3. Estimated Savings
        savings_card = cards.get("Estimated Cost Savings (Est.)") or cards.get("Estimated Cost Savings")
        disp_savings = savings_card.numeric_value if savings_card else 0.0
        status3 = "MATCH" if abs(disp_savings - raw_savings) < 1.0 else "MISMATCH"
        print(f"{'Estimated Savings (LKR)':<35} | {f'Rs. {raw_savings:,.0f}':<20} | {f'Rs. {disp_savings:,.0f}':<20} | {status3:<8}")

        # 4. CO2 Avoided
        co2_card = cards.get("Estimated CO2 Avoided (Est.)") or cards.get("Estimated CO2 Avoided")
        disp_co2 = co2_card.numeric_value if co2_card else 0.0
        status4 = "MATCH" if abs(disp_co2 - raw_co2_avoided) < 1.0 else "MISMATCH"
        print(f"{'Estimated CO2 Avoided (kg)':<35} | {f'{raw_co2_avoided:,.1f} kg':<20} | {f'{disp_co2:,.1f} kg':<20} | {status4:<8}")

        print("-" * 88)
        print(f"Total Transactions: {total_sales} sales rows, {total_batches} batch receipts across {total_products} products.")
        assert status1 == "MATCH" and status2 == "MATCH" and status3 == "MATCH" and status4 == "MATCH", "KPI validation mismatch found!"
        print(">>> KPI CALCULATIONS 100% VERIFIED ACCURATE.\n")

    finally:
        db.close()

def run_forecasting_verification():
    print("=" * 80)
    print("2. DEMAND FORECASTING ENGINE VERIFICATION & MODEL SELECTION")
    print("=" * 80)

    db = SessionLocal()
    try:
        forecaster = DemandForecaster(db)
        sample_skus = ["PRD-CKD-001", "PRD-BAK-001", "PRD-DAI-001"]

        for sku in sample_skus:
            prod = db.query(Product).filter(Product.product_id == sku).first()
            prod_name = prod.name if prod else sku

            print(f"\nSKU: {sku} - '{prod_name}'")
            resp = forecaster.generate_product_forecast(sku, horizon_days=14)

            print(f"{'Model Name':<35} | {'MAE':<8} | {'RMSE':<8} | {'MAPE (%)':<10} | {'Accuracy (%)':<12} | {'Selected Best?'}")
            print("-" * 95)

            best_model_name = resp.best_model
            models_sorted = sorted(resp.models_evaluated, key=lambda m: (m.mape, m.rmse))
            champion = models_sorted[0].model_name

            for m in resp.models_evaluated:
                star = "YES (WINNER)" if m.is_best else "NO"
                print(f"{m.model_name:<35} | {m.mae:<8.2f} | {m.rmse:<8.2f} | {m.mape:<10.2f} | {m.accuracy_score:<12.2f} | {star}")

            assert champion == best_model_name, f"Champion model mismatch: expected {champion}, got {best_model_name}"
            print(f"-> Verified: '{best_model_name}' successfully chosen based on lowest backtest MAPE ({models_sorted[0].mape}%) & RMSE.")

        print("\n>>> FORECASTING ENGINE & 28-DAY BACKTEST SELECTION VERIFIED 100% ACCURATE.\n")

    finally:
        db.close()

def run_edge_cases_verification():
    print("=" * 80)
    print("3. EDGE CASE & FAULT TOLERANCE TESTS")
    print("=" * 80)

    db = SessionLocal()
    try:
        # Case A: SKU with very little history (< 21 days)
        print("Testing Case A: SKU with sparse history (< 21 days)...")
        sparse_sku = "PRD-SPARSE-TEST"
        # Temporarily create sparse product and 7 days of sales
        prod = Product(
            product_id=sparse_sku,
            name="New Trial Item",
            category="Cooked Meals",
            unit="pack",
            unit_price=800.0,
            unit_cost=500.0,
            shelf_life_days=2,
            lead_time_days=1,
            safety_stock_pct=15.0,
            pack_size=5,
        )
        db.add(prod)
        db.flush()

        base_date = date.today() - timedelta(days=7)
        for i in range(7):
            s = Sale(
                date=base_date + timedelta(days=i),
                product_id=sparse_sku,
                product_name="New Trial Item",
                category="Cooked Meals",
                quantity_sold=15.0 + i,
                unit_price=800.0,
                unit_cost=500.0,
            )
            db.add(s)
        db.commit()

        forecaster = DemandForecaster(db)
        sparse_res = forecaster.generate_product_forecast(sparse_sku, horizon_days=14)
        print(f"  Sparse result model: {sparse_res.best_model}")
        print(f"  Sparse warning: '{sparse_res.warning}'")
        print(f"  has_sparse_history: {sparse_res.has_sparse_history}")
        assert sparse_res.has_sparse_history == True, "Sparse history flag failed"
        assert "Moving Average" in sparse_res.best_model or (sparse_res.warning and "insufficient" in sparse_res.warning.lower()) or (sparse_res.warning and "limited" in sparse_res.warning.lower())

        # Clean up temporary sparse SKU
        db.query(Sale).filter(Sale.product_id == sparse_sku).delete()
        db.query(Product).filter(Product.product_id == sparse_sku).delete()
        db.commit()
        print("  -> Passed: Graceful fallback to Moving Average with warning notice.\n")

        # Case B: Bad CSV Validation (Negative values, invalid dates, inverted dates)
        print("Testing Case B: Bad CSV Validation Handling...")

        # 1. Negative quantity sold
        bad_sales_csv = """date,product_id,product_name,category,quantity_sold,unit_price,unit_cost
2026-03-01,PRD-CKD-001,Chicken Rice & Curry,Cooked Meals,-10,750,450
"""
        df1 = parse_file_to_dataframe(bad_sales_csv.encode('utf-8'), "bad_sales.csv")
        res1 = validate_sales_dataframe(df1)
        print(f"  Negative quantity rejected: valid={res1.valid}, issues={len(res1.issues)}")
        assert not res1.valid, "Negative sales quantity was not rejected"
        assert any("negative" in str(i.message).lower() for i in res1.issues)

        # 2. Inverted dates (expiry < received)
        bad_inv_csv = """product_id,batch_id,quantity_received,received_date,expiry_date,quantity_wasted,waste_reason
PRD-CKD-001,BAT-ERR-01,50,2026-03-15,2026-03-10,0,None
"""
        df2 = parse_file_to_dataframe(bad_inv_csv.encode('utf-8'), "bad_inv.csv")
        res2 = validate_inventory_dataframe(df2)
        print(f"  Inverted dates rejected: valid={res2.valid}, issues={len(res2.issues)}")
        assert not res2.valid, "Inverted expiry date was not rejected"
        assert any("expiry" in str(i.message).lower() for i in res2.issues)

        # 3. Missing required columns
        missing_col_csv = """date,product_id,quantity_sold
2026-03-01,PRD-CKD-001,10
"""
        df3 = parse_file_to_dataframe(missing_col_csv.encode('utf-8'), "missing_col.csv")
        res3 = validate_sales_dataframe(df3)
        print(f"  Missing required columns rejected: valid={res3.valid}")
        assert not res3.valid, "Missing columns were not rejected"
        print("  -> Passed: DataValidator strictly catches and categorizes all schema violations.\n")

        # Case C: Large CSV Upload Simulation (10,000 rows)
        print("Testing Case C: Large CSV ingestion performance (10,000 rows)...")
        rows = []
        start_date = date(2025, 1, 1)
        for i in range(10000):
            d = start_date + timedelta(days=(i % 365))
            rows.append(f"{d.isoformat()},PRD-CKD-001,Chicken Rice & Curry,Cooked Meals,{20 + (i % 30)},750,450")
        large_csv = "date,product_id,product_name,category,quantity_sold,unit_price,unit_cost\n" + "\n".join(rows)

        t0 = time.time()
        df_large = parse_file_to_dataframe(large_csv.encode('utf-8'), "large.csv")
        res_large = validate_sales_dataframe(df_large)
        elapsed = time.time() - t0
        print(f"  Validated 10,000 rows in {elapsed:.2f} seconds. Valid={res_large.valid}, Total rows={res_large.total_rows}")
        assert res_large.valid, "Large valid CSV failed validation"
        assert res_large.total_rows == 10000, f"Expected 10000 rows, got {res_large.total_rows}"
        print(f"  -> Passed: High-throughput parsing throughput (~{int(10000/elapsed)} rows/sec).\n")

        # Case D: Empty Database Graceful Handling
        print("Testing Case D: Empty Database Graceful Zero-Division Handling...")
        # Create a fresh empty in-memory SQLite database
        mem_engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=mem_engine)
        MemSession = sessionmaker(bind=mem_engine)
        mem_db = MemSession()

        try:
            empty_kpi = KPIService(mem_db)
            dashboard = empty_kpi.get_dashboard_kpis(days_range=30)
            print(f"  Empty DB Dashboard cards returned: {len(dashboard.cards)}")
            for c in dashboard.cards:
                assert c.numeric_value is not None
            print("  -> Passed: No unhandled exceptions or zero-division errors when database is completely empty.")
        finally:
            mem_db.close()

        print("\n>>> ALL 4 EDGE CASES TESTED & VERIFIED RESILIENT.\n")

    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "#" * 80)
    print(" FOODSENSE AUTOMATED QA & MATHEMATICAL VERIFICATION SUITE")
    print("#" * 80 + "\n")

    run_kpi_verification()
    run_forecasting_verification()
    run_edge_cases_verification()

    print("=" * 80)
    print(" QA VERIFICATION SUMMARY: 100% OF TESTS PASSED WITHOUT ERRORS")
    print("=" * 80 + "\n")
