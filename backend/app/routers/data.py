import os
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db, Base, engine
from ..models import Sale, InventoryBatch, Product, ForecastCache
from ..seed.generate_sample_data import seed_database
from ..services.forecasting import DemandForecaster

router = APIRouter(prefix="/data", tags=["Data Management"])

@router.post("/load-sample")
def load_sample_data(db: Session = Depends(get_db)):
    """
    Clears current transactions, seeds 12 months of realistic Sri Lankan sales & inventory,
    and automatically calculates & caches demand forecasts.
    """
    try:
        seed_database(db, force=True)
        # Recalculate & cache all forecasts
        forecaster = DemandForecaster(db)
        forecaster.cache_all_forecasts()
        return {
            "success": True,
            "message": "Successfully loaded 12 months of realistic Sri Lankan sample data and generated initial forecasts.",
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to load sample data: {str(e)}")

@router.post("/reset")
def reset_data(db: Session = Depends(get_db)):
    """
    Clears all sales, batches and forecast caches.
    """
    try:
        db.query(ForecastCache).delete()
        db.query(Sale).delete()
        db.query(InventoryBatch).delete()
        db.commit()
        return {"success": True, "message": "All operational data reset successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")

@router.get("/templates/{dataset_type}")
def download_template(dataset_type: str):
    """
    Provides downloadable blank CSV templates for sales or inventory uploads.
    """
    if dataset_type == "sales":
        filepath = "sample_data/templates/sales_template.csv"
        filename = "foodsense_sales_template.csv"
    elif dataset_type == "inventory":
        filepath = "sample_data/templates/inventory_template.csv"
        filename = "foodsense_inventory_template.csv"
    else:
        raise HTTPException(status_code=400, detail="Invalid dataset type. Choose 'sales' or 'inventory'.")

    if not os.path.exists(filepath):
        # Generate inline
        if dataset_type == "sales":
            content = "date,product_id,product_name,category,quantity_sold,unit_price,unit_cost\n"
        else:
            content = "product_id,batch_id,quantity_received,received_date,expiry_date,quantity_wasted,waste_reason\n"
        return Response(content=content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})

    return FileResponse(path=filepath, media_type="text/csv", filename=filename)

@router.get("/sample-file/{dataset_type}")
def download_sample_file(dataset_type: str):
    """
    Provides full pre-generated sample CSV files for quick panel testing.
    """
    if dataset_type == "sales":
        filepath = "sample_data/sales_sample.csv"
        filename = "foodsense_sales_sample.csv"
    elif dataset_type == "inventory":
        filepath = "sample_data/inventory_sample.csv"
        filename = "foodsense_inventory_sample.csv"
    else:
        raise HTTPException(status_code=400, detail="Invalid dataset type.")

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Sample file not generated yet. Click 'Load Sample Data' first.")

    return FileResponse(path=filepath, media_type="text/csv", filename=filename)

from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime
from ..models.entities import NotificationItem

class QuickWasteLogRequest(BaseModel):
    product_id: str
    quantity_wasted: float
    waste_reason: str = "Prep Trim"
    notes: Optional[str] = None
    outlet_id: Optional[str] = "OUT-CMB"

@router.post("/quick-waste-log")
def log_quick_waste(req: QuickWasteLogRequest, db: Session = Depends(get_db)):
    """
    Touch-optimized kitchen waste logging endpoint for tablet/wall terminals.
    Immediately records wasted quantity, computes financial loss, and notifies managers.
    """
    prod = db.query(Product).filter(Product.product_id == req.product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    unit_cost = prod.unit_cost or 250.0
    waste_cost = round(req.quantity_wasted * unit_cost, 2)
    today = date.today()

    # Find recent active batch or create an operational shift batch
    batch = (
        db.query(InventoryBatch)
        .filter(InventoryBatch.product_id == req.product_id)
        .order_by(InventoryBatch.received_date.desc())
        .first()
    )

    if batch:
        batch.quantity_wasted += req.quantity_wasted
        batch.waste_cost += waste_cost
        batch.waste_reason = req.waste_reason
    else:
        batch = InventoryBatch(
            batch_id=f"B-QUICK-{int(datetime.utcnow().timestamp())}",
            product_id=req.product_id,
            quantity_received=req.quantity_wasted,
            quantity_wasted=req.quantity_wasted,
            received_date=today,
            expiry_date=today,
            waste_reason=req.waste_reason,
            waste_cost=waste_cost,
            status="Wasted",
        )
        db.add(batch)

    # Post real-time in-app notification
    notif = NotificationItem(
        title="Kitchen Waste Logged",
        message=f"{req.quantity_wasted:.1f} {prod.unit} of {prod.name} logged ({req.waste_reason}) at {req.outlet_id}. Financial impact: Rs. {waste_cost:,.2f}.",
        category="Alert",
        link_url="/alerts",
        is_read=False,
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "product_id": prod.product_id,
        "product_name": prod.name,
        "quantity_wasted": req.quantity_wasted,
        "unit": prod.unit,
        "waste_reason": req.waste_reason,
        "waste_cost_lkr": waste_cost,
        "logged_at": datetime.utcnow().strftime("%H:%M:%S"),
        "message": f"Successfully logged {req.quantity_wasted} {prod.unit} of {prod.name} ({req.waste_reason}).",
    }
