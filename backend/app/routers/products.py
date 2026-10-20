from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product, InventoryBatch
from ..schemas.dtos import ProductOut, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    """
    Returns list of all active products with current stock quantities.
    """
    products = db.query(Product).filter(Product.is_active == True).order_by(Product.category, Product.name).all()
    results = []
    for p in products:
        # Sum active current_quantity
        stock = (
            db.query(InventoryBatch)
            .filter(
                InventoryBatch.product_id == p.product_id,
                InventoryBatch.status == "Active",
            )
            .all()
        )
        total_stock = sum(b.current_quantity for b in stock)
        
        results.append(
            ProductOut(
                product_id=p.product_id,
                name=p.name,
                category=p.category,
                unit=p.unit,
                unit_price=p.unit_price,
                unit_cost=p.unit_cost,
                shelf_life_days=p.shelf_life_days,
                lead_time_days=p.lead_time_days,
                safety_stock_pct=p.safety_stock_pct,
                pack_size=p.pack_size,
                current_stock=round(total_stock, 1),
            )
        )
    return results

@router.put("/{product_id}", response_model=ProductOut)
def update_product_settings(product_id: str, req: ProductUpdate, db: Session = Depends(get_db)):
    """
    Updates configurable inventory parameters per product.
    """
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if req.lead_time_days is not None:
        product.lead_time_days = req.lead_time_days
    if req.safety_stock_pct is not None:
        product.safety_stock_pct = req.safety_stock_pct
    if req.pack_size is not None:
        product.pack_size = req.pack_size
    if req.shelf_life_days is not None:
        product.shelf_life_days = req.shelf_life_days

    db.commit()
    db.refresh(product)

    stock = (
        db.query(InventoryBatch)
        .filter(InventoryBatch.product_id == product.product_id, InventoryBatch.status == "Active")
        .all()
    )
    total_stock = sum(b.current_quantity for b in stock)

    return ProductOut(
        product_id=product.product_id,
        name=product.name,
        category=product.category,
        unit=product.unit,
        unit_price=product.unit_price,
        unit_cost=product.unit_cost,
        shelf_life_days=product.shelf_life_days,
        lead_time_days=product.lead_time_days,
        safety_stock_pct=product.safety_stock_pct,
        pack_size=product.pack_size,
        current_stock=round(total_stock, 1),
    )
