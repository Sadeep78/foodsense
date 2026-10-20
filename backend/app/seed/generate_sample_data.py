import os
import random
import math
from datetime import date, timedelta, datetime
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..database import engine, Base, SessionLocal
from ..models import User, BusinessProfile, Product, Sale, InventoryBatch, ForecastCache, SystemSettings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PRODUCTS_CATALOG = [
    # Bakery
    {
        "product_id": "PRD-BAK-001",
        "name": "Kimbula Banis (Pack of 5)",
        "category": "Bakery",
        "unit": "packs",
        "unit_price": 450.0,
        "unit_cost": 270.0,
        "shelf_life_days": 2,
        "lead_time_days": 1,
        "safety_stock_pct": 20.0,
        "pack_size": 5,
        "base_daily_demand": 45,
    },
    {
        "product_id": "PRD-BAK-002",
        "name": "Wood-Fired Roast Paan",
        "category": "Bakery",
        "unit": "loaves",
        "unit_price": 180.0,
        "unit_cost": 105.0,
        "shelf_life_days": 1,
        "lead_time_days": 1,
        "safety_stock_pct": 15.0,
        "pack_size": 10,
        "base_daily_demand": 75,
    },
    {
        "product_id": "PRD-BAK-003",
        "name": "Pol Roti with Lunu Miris",
        "category": "Bakery",
        "unit": "portions",
        "unit_price": 250.0,
        "unit_cost": 140.0,
        "shelf_life_days": 1,
        "lead_time_days": 1,
        "safety_stock_pct": 15.0,
        "pack_size": 10,
        "base_daily_demand": 60,
    },
    # Dairy
    {
        "product_id": "PRD-DAI-001",
        "name": "Highland Fresh Milk 1L",
        "category": "Dairy",
        "unit": "cartons",
        "unit_price": 520.0,
        "unit_cost": 410.0,
        "shelf_life_days": 7,
        "lead_time_days": 2,
        "safety_stock_pct": 18.0,
        "pack_size": 12,
        "base_daily_demand": 38,
    },
    {
        "product_id": "PRD-DAI-002",
        "name": "Curd Clay Pot 1kg (Ruhunu)",
        "category": "Dairy",
        "unit": "pots",
        "unit_price": 680.0,
        "unit_cost": 490.0,
        "shelf_life_days": 6,
        "lead_time_days": 2,
        "safety_stock_pct": 20.0,
        "pack_size": 6,
        "base_daily_demand": 28,
    },
    {
        "product_id": "PRD-DAI-003",
        "name": "Pelwatte Salted Butter 200g",
        "category": "Dairy",
        "unit": "packs",
        "unit_price": 850.0,
        "unit_cost": 660.0,
        "shelf_life_days": 30,
        "lead_time_days": 3,
        "safety_stock_pct": 10.0,
        "pack_size": 10,
        "base_daily_demand": 18,
    },
    # Vegetables
    {
        "product_id": "PRD-VEG-001",
        "name": "Nuwara Eliya Carrots (kg)",
        "category": "Vegetables",
        "unit": "kg",
        "unit_price": 420.0,
        "unit_cost": 290.0,
        "shelf_life_days": 4,
        "lead_time_days": 1,
        "safety_stock_pct": 15.0,
        "pack_size": 5,
        "base_daily_demand": 35,
    },
    {
        "product_id": "PRD-VEG-002",
        "name": "Bandakka / Okra (kg)",
        "category": "Vegetables",
        "unit": "kg",
        "unit_price": 340.0,
        "unit_cost": 220.0,
        "shelf_life_days": 3,
        "lead_time_days": 1,
        "safety_stock_pct": 15.0,
        "pack_size": 5,
        "base_daily_demand": 24,
    },
    {
        "product_id": "PRD-VEG-003",
        "name": "Sri Lankan Red Onions (kg)",
        "category": "Vegetables",
        "unit": "kg",
        "unit_price": 580.0,
        "unit_cost": 440.0,
        "shelf_life_days": 14,
        "lead_time_days": 2,
        "safety_stock_pct": 12.0,
        "pack_size": 10,
        "base_daily_demand": 40,
    },
    # Fruits
    {
        "product_id": "PRD-FRU-001",
        "name": "Ambul Bananas (Dozen)",
        "category": "Fruits",
        "unit": "dozens",
        "unit_price": 360.0,
        "unit_cost": 230.0,
        "shelf_life_days": 3,
        "lead_time_days": 1,
        "safety_stock_pct": 20.0,
        "pack_size": 6,
        "base_daily_demand": 50,
    },
    {
        "product_id": "PRD-FRU-002",
        "name": "Red Lady Papaya (kg)",
        "category": "Fruits",
        "unit": "kg",
        "unit_price": 320.0,
        "unit_cost": 200.0,
        "shelf_life_days": 4,
        "lead_time_days": 1,
        "safety_stock_pct": 18.0,
        "pack_size": 5,
        "base_daily_demand": 30,
    },
    {
        "product_id": "PRD-FRU-003",
        "name": "Ceylon Karthakolomban Mango (kg)",
        "category": "Fruits",
        "unit": "kg",
        "unit_price": 750.0,
        "unit_cost": 520.0,
        "shelf_life_days": 5,
        "lead_time_days": 2,
        "safety_stock_pct": 15.0,
        "pack_size": 5,
        "base_daily_demand": 22,
    },
    # Meat & Fish
    {
        "product_id": "PRD-MEA-001",
        "name": "Fresh Broiler Chicken Curry Cut (kg)",
        "category": "Meat & Fish",
        "unit": "kg",
        "unit_price": 1350.0,
        "unit_cost": 1050.0,
        "shelf_life_days": 2,
        "lead_time_days": 1,
        "safety_stock_pct": 15.0,
        "pack_size": 5,
        "base_daily_demand": 55,
    },
    {
        "product_id": "PRD-MEA-002",
        "name": "Fresh Balaya / Tuna Steaks (kg)",
        "category": "Meat & Fish",
        "unit": "kg",
        "unit_price": 1850.0,
        "unit_cost": 1420.0,
        "shelf_life_days": 2,
        "lead_time_days": 1,
        "safety_stock_pct": 15.0,
        "pack_size": 5,
        "base_daily_demand": 32,
    },
    # Cooked Meals
    {
        "product_id": "PRD-CKD-001",
        "name": "Chicken Rice & Curry Pack (Basmati)",
        "category": "Cooked Meals",
        "unit": "packs",
        "unit_price": 650.0,
        "unit_cost": 360.0,
        "shelf_life_days": 1,
        "lead_time_days": 1,
        "safety_stock_pct": 12.0,
        "pack_size": 10,
        "base_daily_demand": 95,
    },
    {
        "product_id": "PRD-CKD-002",
        "name": "Special Chicken Kottu Roti",
        "category": "Cooked Meals",
        "unit": "portions",
        "unit_price": 950.0,
        "unit_cost": 520.0,
        "shelf_life_days": 1,
        "lead_time_days": 1,
        "safety_stock_pct": 12.0,
        "pack_size": 5,
        "base_daily_demand": 80,
    },
    {
        "product_id": "PRD-CKD-003",
        "name": "Sri Lankan Fish Cutlet (Pack of 4)",
        "category": "Cooked Meals",
        "unit": "packs",
        "unit_price": 400.0,
        "unit_cost": 210.0,
        "shelf_life_days": 1,
        "lead_time_days": 1,
        "safety_stock_pct": 18.0,
        "pack_size": 6,
        "base_daily_demand": 65,
    },
    # Beverages
    {
        "product_id": "PRD-BEV-001",
        "name": "Fresh Royal King Coconut",
        "category": "Beverages",
        "unit": "nuts",
        "unit_price": 180.0,
        "unit_cost": 110.0,
        "shelf_life_days": 5,
        "lead_time_days": 1,
        "safety_stock_pct": 15.0,
        "pack_size": 10,
        "base_daily_demand": 50,
    },
]

def is_sri_lankan_holiday(dt: date) -> tuple[bool, str, float]:
    """
    Returns (is_holiday, holiday_name, demand_multiplier).
    Models Sinhala & Tamil New Year (mid-April), Vesak (May), Poson (June),
    Christmas / New Year season (Dec 22-Jan 2), and monthly Poya days.
    """
    m, d = dt.month, dt.day
    # Sinhala & Tamil New Year (April 11-16)
    if m == 4 and 11 <= d <= 16:
        return True, "Sinhala & Tamil New Year Festival", 1.85
    # Vesak (around May 15-18)
    if m == 5 and 15 <= d <= 18:
        return True, "Vesak Festival Season", 1.45
    # Poson Poya (mid June)
    if m == 6 and 18 <= d <= 21:
        return True, "Poson Festival", 1.35
    # Christmas & Year-End festive week (Dec 22 - Jan 2)
    if (m == 12 and d >= 22) or (m == 1 and d <= 2):
        return True, "Christmas & Festive Season", 1.70
    # Monthly Poya Day approximation (around 15th-18th of each month)
    if d in (15, 16):
        return True, "Full Moon Poya Day", 1.25

    return False, "Regular Day", 1.0

def generate_sample_dataset(days_back: int = 365, end_date: date = None):
    """
    Generates realistic 365-day sales and inventory batch data.
    """
    if end_date is None:
        end_date = date.today()
    start_date = end_date - timedelta(days=days_back)

    sales_records = []
    inventory_records = []

    random.seed(42)
    np.random.seed(42)

    current_dt = start_date
    batch_counter = 1000

    while current_dt <= end_date:
        dow = current_dt.weekday()  # 0=Monday, 6=Sunday
        is_weekend = dow in (4, 5, 6)  # Fri, Sat, Sun
        is_holiday, holiday_name, holiday_mult = is_sri_lankan_holiday(current_dt)

        for prod in PRODUCTS_CATALOG:
            cat = prod["category"]
            base = prod["base_daily_demand"]

            # Seasonality & day-of-week multipliers
            if is_weekend:
                if cat in ("Cooked Meals", "Bakery", "Beverages"):
                    dow_mult = 1.35 + (0.15 if dow == 5 else 0.05)
                elif cat in ("Meat & Fish", "Fruits"):
                    dow_mult = 1.30
                else:
                    dow_mult = 1.15
            else:
                # Monday is slightly slower, midweek steady
                dow_mult = 0.85 if dow == 0 else 0.95

            # Special case: On Poya / Vesak, meat sales drop, veg/fruits/dairy increase
            if "Poya" in holiday_name or "Vesak" in holiday_name:
                if cat == "Meat & Fish":
                    holiday_mult = 0.45
                elif cat in ("Vegetables", "Dairy", "Fruits"):
                    holiday_mult = 1.55

            # Trend component: subtle business growth over the year (+15% over 12 months)
            day_fraction = (current_dt - start_date).days / max(days_back, 1)
            growth_trend = 1.0 + (day_fraction * 0.15)

            # Random noise: normal distribution around 1.0
            noise = np.random.normal(1.0, 0.08)

            expected_demand = base * dow_mult * holiday_mult * growth_trend * noise
            qty_sold = max(0, int(round(expected_demand)))

            revenue = round(qty_sold * prod["unit_price"], 2)
            cost = round(qty_sold * prod["unit_cost"], 2)

            sales_records.append({
                "date": current_dt.strftime("%Y-%m-%d"),
                "product_id": prod["product_id"],
                "product_name": prod["name"],
                "category": prod["category"],
                "quantity_sold": qty_sold,
                "unit_price": prod["unit_price"],
                "unit_cost": prod["unit_cost"],
                "revenue": revenue,
                "total_cost": cost,
                "day_of_week": dow,
            })

            # Inventory batches: simulate batch arrivals according to shelf life and order cycles
            # Typically a batch arrives every (shelf_life - 1) days or lead_time
            arrival_frequency = max(1, prod["shelf_life_days"] - 1)
            is_delivery_day = (current_dt - start_date).days % arrival_frequency == 0

            if is_delivery_day:
                batch_counter += 1
                batch_id = f"BAT-{current_dt.strftime('%y%m%d')}-{prod['product_id'][-3:]}-{batch_counter}"
                
                # Order quantity: simulates naive manager behavior
                # Managers tend to over-order on Mondays or before weekends (+20-30% surplus)
                safety_buffer = 1.0 + (prod["safety_stock_pct"] / 100.0)
                if dow == 0:  # Monday over-ordering syndrome!
                    safety_buffer += 0.15
                
                cycle_demand = base * arrival_frequency * dow_mult * safety_buffer
                received_qty = max(prod["pack_size"], int(math.ceil(cycle_demand / prod["pack_size"]) * prod["pack_size"]))
                
                expiry_dt = current_dt + timedelta(days=prod["shelf_life_days"])
                
                # Waste calculation: items that expire past shelf life or overcooked
                # If batch is in the past:
                days_since_arrival = (end_date - current_dt).days
                if days_since_arrival > prod["shelf_life_days"]:
                    # Batch is finished. Did it produce waste?
                    # Realistic waste rate: 3% to 14% depending on category
                    if cat in ("Cooked Meals", "Bakery"):
                        waste_rate = np.random.uniform(0.06, 0.14)
                    elif cat in ("Vegetables", "Fruits"):
                        waste_rate = np.random.uniform(0.05, 0.12)
                    elif cat == "Meat & Fish":
                        waste_rate = np.random.uniform(0.04, 0.09)
                    else:
                        waste_rate = np.random.uniform(0.01, 0.04)

                    qty_wasted = round(received_qty * waste_rate, 1)
                    # Pick realistic waste reason
                    reasons = ["Expired", "Unsold", "Overcooked", "Quality Deterioration", "Storage Failure"]
                    weights = [0.45, 0.30, 0.15 if cat == "Cooked Meals" else 0.02, 0.15, 0.08]
                    # Normalize weights
                    w_sum = sum(weights)
                    norm_weights = [w / w_sum for w in weights]
                    reason = np.random.choice(reasons, p=norm_weights)
                    waste_cost = round(qty_wasted * prod["unit_cost"], 2)
                    status = "Expired" if qty_wasted > 0 else "Consumed"
                    current_qty = 0.0
                else:
                    # Current active batch expiring soon or active
                    days_remaining = (expiry_dt - end_date).days
                    current_qty = round(received_qty * max(0.1, (days_remaining / max(1, prod["shelf_life_days"]))), 1)
                    qty_wasted = 0.0
                    reason = "None"
                    waste_cost = 0.0
                    status = "Active"

                inventory_records.append({
                    "batch_id": batch_id,
                    "product_id": prod["product_id"],
                    "quantity_received": received_qty,
                    "current_quantity": current_qty,
                    "received_date": current_dt.strftime("%Y-%m-%d"),
                    "expiry_date": expiry_dt.strftime("%Y-%m-%d"),
                    "quantity_wasted": qty_wasted,
                    "waste_reason": reason,
                    "waste_cost": waste_cost,
                    "status": status,
                })

        current_dt += timedelta(days=1)

    return sales_records, inventory_records

def seed_database(db: Session, force: bool = False):
    """
    Populates the database with products, demo user, business profile,
    and 12 months of realistic sales & inventory records.
    """
    # Check if already seeded
    existing_user = db.query(User).filter(User.email == "manager@foodsense.lk").first()
    if existing_user and not force:
        print("[FoodSense Seed] Database already contains demo user. Skipping seed.")
        return

    # Clear existing tables if force
    if force:
        db.query(ForecastCache).delete()
        db.query(Sale).delete()
        db.query(InventoryBatch).delete()
        db.query(Product).delete()
        db.query(BusinessProfile).delete()
        db.query(User).delete()
        db.query(SystemSettings).delete()
        db.commit()

    print("[FoodSense Seed] Starting database initialization & seed...")

    # 1. System Settings
    settings = SystemSettings(
        currency="LKR",
        default_safety_stock_pct=15.0,
        default_lead_time_days=2,
        alert_days_urgent=1,
        alert_days_warning=3,
        alert_days_notice=7,
        co2_factor_food_waste=2.5,
    )
    db.add(settings)

    # 2. Demo User
    demo_user = User(
        email="manager@foodsense.lk",
        hashed_password=pwd_context.hash("demo1234"),
        full_name="Nimsara Perera",
        role="Store Manager & Head of Procurement",
    )
    db.add(demo_user)
    db.flush()

    # 3. Business Profile
    profile = BusinessProfile(
        user_id=demo_user.id,
        business_name="Colombo Gourmet Kitchen & Fresh Supermarket",
        business_type="Restaurant",
        currency="LKR",
        outlet_name="Colombo 03 Flagship Store",
        address="142 Galle Road, Colombo 03, Western Province, Sri Lanka",
    )
    db.add(profile)

    # 4. Products Catalog
    for p in PRODUCTS_CATALOG:
        product = Product(
            product_id=p["product_id"],
            name=p["name"],
            category=p["category"],
            unit=p["unit"],
            unit_price=p["unit_price"],
            unit_cost=p["unit_cost"],
            shelf_life_days=p["shelf_life_days"],
            lead_time_days=p["lead_time_days"],
            safety_stock_pct=p["safety_stock_pct"],
            pack_size=p["pack_size"],
            is_active=True,
        )
        db.add(product)
    db.flush()

    # 5. Generate 365 Days of Sales and Inventory
    sales_data, inventory_data = generate_sample_dataset(days_back=365)

    # Bulk insert sales
    sales_objs = [
        Sale(
            date=datetime.strptime(s["date"], "%Y-%m-%d").date(),
            product_id=s["product_id"],
            product_name=s["product_name"],
            category=s["category"],
            quantity_sold=s["quantity_sold"],
            unit_price=s["unit_price"],
            unit_cost=s["unit_cost"],
            revenue=s["revenue"],
            total_cost=s["total_cost"],
            day_of_week=s["day_of_week"],
        )
        for s in sales_data
    ]
    db.bulk_save_objects(sales_objs)

    # Bulk insert inventory batches
    batch_objs = [
        InventoryBatch(
            batch_id=b["batch_id"],
            product_id=b["product_id"],
            quantity_received=b["quantity_received"],
            current_quantity=b["current_quantity"],
            received_date=datetime.strptime(b["received_date"], "%Y-%m-%d").date(),
            expiry_date=datetime.strptime(b["expiry_date"], "%Y-%m-%d").date(),
            quantity_wasted=b["quantity_wasted"],
            waste_reason=b["waste_reason"],
            waste_cost=b["waste_cost"],
            status=b["status"],
        )
        for b in inventory_data
    ]
    db.bulk_save_objects(batch_objs)

    db.commit()
    print(f"[FoodSense Seed] Successfully seeded {len(sales_objs)} sales rows and {len(batch_objs)} inventory batches.")

    # Also save CSV files and templates to sample_data/
    save_sample_csv_files(sales_data, inventory_data)

def save_sample_csv_files(sales_data: list, inventory_data: list):
    """
    Saves CSV files to sample_data directory for easy manager uploads and testing.
    """
    os.makedirs("sample_data/templates", exist_ok=True)

    sales_df = pd.DataFrame(sales_data)[
        ["date", "product_id", "product_name", "category", "quantity_sold", "unit_price", "unit_cost"]
    ]
    sales_df.to_csv("sample_data/sales_sample.csv", index=False)

    inventory_df = pd.DataFrame(inventory_data)[
        ["product_id", "batch_id", "quantity_received", "received_date", "expiry_date", "quantity_wasted", "waste_reason"]
    ]
    inventory_df.to_csv("sample_data/inventory_sample.csv", index=False)

    # Empty templates with header row only
    sales_df.head(0).to_csv("sample_data/templates/sales_template.csv", index=False)
    inventory_df.head(0).to_csv("sample_data/templates/inventory_template.csv", index=False)
    print("[FoodSense Seed] Saved sample CSVs and templates in /sample_data")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db_session = SessionLocal()
    seed_database(db_session, force=True)
    db_session.close()
