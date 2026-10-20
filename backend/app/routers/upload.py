from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd

from ..database import get_db
from ..models import Sale, InventoryBatch, Product
from ..schemas.dtos import UploadValidationResult, ConfirmUploadRequest, UploadResponse
from ..services.validation import parse_file_to_dataframe, validate_sales_dataframe, validate_inventory_dataframe
from ..services.forecasting import DemandForecaster

router = APIRouter(prefix="/upload", tags=["Data Upload"])

@router.post("/sales/validate", response_model=UploadValidationResult)
async def validate_sales_file(file: UploadFile = File(...)):
    """
    Validates an uploaded sales CSV/XLSX file and returns validation issues with preview.
    """
    content = await file.read()
    try:
        df = parse_file_to_dataframe(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    result = validate_sales_dataframe(df)
    return result

@router.post("/sales/confirm", response_model=UploadResponse)
def confirm_sales_upload(request: ConfirmUploadRequest, db: Session = Depends(get_db)):
    """
    Persists validated sales rows into the database and triggers forecast recalculation.
    """
    if not request.rows:
        raise HTTPException(status_code=400, detail="No rows provided for import.")

    inserted_count = 0
    try:
        for r in request.rows:
            # Parse date
            dt = datetime.strptime(str(r["date"])[:10], "%Y-%m-%d").date()
            pid = str(r["product_id"]).strip().upper()
            
            # Ensure product exists
            product = db.query(Product).filter(Product.product_id == pid).first()
            if not product:
                product = Product(
                    product_id=pid,
                    name=str(r.get("product_name", pid)),
                    category=str(r.get("category", "General")),
                    unit="units",
                    unit_price=float(r.get("unit_price", 0.0)),
                    unit_cost=float(r.get("unit_cost", 0.0)),
                    shelf_life_days=3,
                    lead_time_days=1,
                    safety_stock_pct=15.0,
                    pack_size=1,
                    is_active=True,
                )
                db.add(product)
                db.flush()

            qty = float(r.get("quantity_sold", 0.0))
            u_price = float(r.get("unit_price", product.unit_price))
            u_cost = float(r.get("unit_cost", product.unit_cost))

            sale = Sale(
                date=dt,
                product_id=pid,
                product_name=product.name,
                category=product.category,
                quantity_sold=qty,
                unit_price=u_price,
                unit_cost=u_cost,
                revenue=round(qty * u_price, 2),
                total_cost=round(qty * u_cost, 2),
                day_of_week=dt.weekday(),
            )
            db.add(sale)
            inserted_count += 1

        db.commit()

        # Recalculate and update forecasts in background
        forecaster = DemandForecaster(db)
        forecaster.cache_all_forecasts()

        return UploadResponse(
            success=True,
            message=f"Successfully imported {inserted_count} sales records and updated demand forecast models.",
            rows_imported=inserted_count,
            recalculated_forecasts=True,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database commit error: {str(e)}")

@router.post("/inventory/validate", response_model=UploadValidationResult)
async def validate_inventory_file(file: UploadFile = File(...)):
    """
    Validates an uploaded inventory CSV/XLSX file and returns issues and preview rows.
    """
    content = await file.read()
    try:
        df = parse_file_to_dataframe(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    result = validate_inventory_dataframe(df)
    return result

@router.post("/inventory/confirm", response_model=UploadResponse)
def confirm_inventory_upload(request: ConfirmUploadRequest, db: Session = Depends(get_db)):
    """
    Persists validated inventory batches into the database.
    """
    if not request.rows:
        raise HTTPException(status_code=400, detail="No rows provided for import.")

    inserted_count = 0
    try:
        for r in request.rows:
            pid = str(r["product_id"]).strip().upper()
            batch_id = str(r["batch_id"]).strip()
            
            product = db.query(Product).filter(Product.product_id == pid).first()
            u_cost = product.unit_cost if product else 0.0

            rec_dt = datetime.strptime(str(r["received_date"])[:10], "%Y-%m-%d").date()
            exp_dt = datetime.strptime(str(r["expiry_date"])[:10], "%Y-%m-%d").date()
            qty_rec = float(r.get("quantity_received", 0.0))
            qty_wasted = float(r.get("quantity_wasted", 0.0))
            reason = str(r.get("waste_reason", "None"))
            waste_cost = round(qty_wasted * u_cost, 2)

            batch = InventoryBatch(
                batch_id=batch_id,
                product_id=pid,
                quantity_received=qty_rec,
                current_quantity=max(0.0, qty_rec - qty_wasted),
                received_date=rec_dt,
                expiry_date=exp_dt,
                quantity_wasted=qty_wasted,
                waste_reason=reason,
                waste_cost=waste_cost,
                status="Active" if qty_wasted == 0 else "Wasted",
            )
            db.add(batch)
            inserted_count += 1

        db.commit()
        return UploadResponse(
            success=True,
            message=f"Successfully imported {inserted_count} inventory batch records.",
            rows_imported=inserted_count,
            recalculated_forecasts=False,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database commit error: {str(e)}")
