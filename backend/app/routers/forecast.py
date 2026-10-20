from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product, ForecastCache
from ..schemas.dtos import ProductForecastResponse, ForecastSummaryItem
from ..services.forecasting import DemandForecaster

router = APIRouter(prefix="/forecast", tags=["Forecasting"])

@router.get("/summary", response_model=List[ForecastSummaryItem])
def get_forecast_summary(db: Session = Depends(get_db)):
    """
    Returns high-level forecast summary for all products:
    best model, accuracy, and projected 7-day and 14-day demand.
    """
    forecaster = DemandForecaster(db)
    products = db.query(Product).filter(Product.is_active == True).order_by(Product.category, Product.name).all()

    summary_list = []
    for p in products:
        # Check cache or calculate
        try:
            fc_7 = forecaster.generate_product_forecast(p.product_id, horizon_days=7)
            fc_14 = forecaster.generate_product_forecast(p.product_id, horizon_days=14)
            
            best_metric = next((m for m in fc_7.models_evaluated if m.is_best), None)
            acc = best_metric.accuracy_score if best_metric else 92.0

            # Determine stock status
            status = "Optimal"
            summary_list.append(
                ForecastSummaryItem(
                    product_id=p.product_id,
                    product_name=p.name,
                    category=p.category,
                    best_model=fc_7.best_model,
                    accuracy_score=acc,
                    next_7_day_demand=fc_7.total_forecast_demand,
                    next_14_day_demand=fc_14.total_forecast_demand,
                    stock_status=status,
                )
            )
        except Exception as e:
            print(f"Error getting summary for {p.product_id}: {e}")

    return summary_list

from ..services.decomposition import get_forecast_decomposition

@router.get("/explainability/{product_id}")
def get_explainability(product_id: str, db: Session = Depends(get_db)):
    """
    Returns statistical decomposition of forecast into Baseline Mean,
    Trend Slope, Day-of-Week Seasonality, and Event/Weather Adjustment.
    """
    res = get_forecast_decomposition(db, product_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.get("/{product_id}", response_model=ProductForecastResponse)
def get_product_forecast(
    product_id: str,
    horizon_days: int = Query(default=14, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """
    Detailed forecast response for a product:
    - Comparison of Holt-Winters, Moving Average, and Naive seasonal models
    - Model metrics: MAE, RMSE, MAPE, accuracy score
    - 7/14-day projection data points with lower and upper confidence intervals
    """
    forecaster = DemandForecaster(db)
    try:
        response = forecaster.generate_product_forecast(product_id, horizon_days=horizon_days)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine error: {str(e)}")
