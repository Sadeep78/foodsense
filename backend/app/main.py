from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .config import settings
from .database import engine, Base, SessionLocal
from .models import User
from .seed.generate_sample_data import seed_database
from .services.forecasting import DemandForecaster

from .routers import (
    auth,
    data,
    upload,
    products,
    forecast,
    recommendations,
    alerts,
    kpis,
    reports,
    settings as settings_router,
    insights,
    discounts,
    donations,
    goals,
    events,
    margins,
    sustainability,
    notifications,
    outlets,
    suppliers,
    recipes,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed database if demo user is absent
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.DEMO_EMAIL).first()
        if not user:
            print("[FoodSense] First run detected. Auto-seeding 12 months Sri Lankan sample data...")
            seed_database(db, force=True)
            forecaster = DemandForecaster(db)
            forecaster.cache_all_forecasts()
            print("[FoodSense] Auto-seed and forecast generation complete.")
    except Exception as e:
        print(f"[FoodSense] Startup seeding check note: {e}")
    finally:
        db.close()

    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Demand Forecasting and Food Waste Analytics Dashboard for Restaurants and Supermarkets",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev & demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(data.router)
app.include_router(upload.router)
app.include_router(products.router)
app.include_router(forecast.router)
app.include_router(recommendations.router)
app.include_router(alerts.router)
app.include_router(kpis.router)
app.include_router(reports.router)
app.include_router(settings_router.router)
app.include_router(insights.router)
app.include_router(discounts.router)
app.include_router(donations.router)
app.include_router(goals.router)
app.include_router(events.router)
app.include_router(margins.router)
app.include_router(sustainability.router)
app.include_router(notifications.router)
app.include_router(outlets.router)
app.include_router(suppliers.router)
app.include_router(recipes.router)

@app.get("/")
def root():
    return {
        "app": "FoodSense API",
        "status": "online",
        "docs": "/docs",
        "version": "1.0.0",
        "university": "SLIIT (Sri Lanka Institute of Information Technology)",
        "specialization": "Data Science & Business Analytics",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
