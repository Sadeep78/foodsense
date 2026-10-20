from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Store Manager")
    role = Column(String(50), default="Manager")
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("BusinessProfile", back_populates="user", uselist=False)

class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    business_name = Column(String(255), default="Colombo Gourmet Kitchen & Market")
    business_type = Column(String(50), default="Restaurant")  # Restaurant / Supermarket
    currency = Column(String(10), default="LKR")
    outlet_name = Column(String(100), default="Main Branch - Colombo 03")
    address = Column(String(255), default="Galle Road, Colombo 03, Sri Lanka")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    unit = Column(String(50), default="units")
    unit_price = Column(Float, nullable=False, default=0.0)
    unit_cost = Column(Float, nullable=False, default=0.0)
    shelf_life_days = Column(Integer, default=3)
    lead_time_days = Column(Integer, default=1)
    safety_stock_pct = Column(Float, default=15.0)
    pack_size = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    sales = relationship("Sale", back_populates="product", cascade="all, delete-orphan")
    batches = relationship("InventoryBatch", back_populates="product", cascade="all, delete-orphan")
    forecasts = relationship("ForecastCache", back_populates="product", cascade="all, delete-orphan")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.product_id"), nullable=False, index=True)
    product_name = Column(String(255))
    category = Column(String(100))
    quantity_sold = Column(Float, nullable=False, default=0.0)
    unit_price = Column(Float, nullable=False, default=0.0)
    unit_cost = Column(Float, nullable=False, default=0.0)
    revenue = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    day_of_week = Column(Integer)  # 0=Monday, 6=Sunday

    product = relationship("Product", back_populates="sales")

class InventoryBatch(Base):
    __tablename__ = "inventory_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(100), index=True, nullable=False)
    product_id = Column(String(50), ForeignKey("products.product_id"), nullable=False, index=True)
    quantity_received = Column(Float, nullable=False, default=0.0)
    current_quantity = Column(Float, nullable=False, default=0.0)
    received_date = Column(Date, nullable=False, index=True)
    expiry_date = Column(Date, nullable=False, index=True)
    quantity_wasted = Column(Float, default=0.0)
    waste_reason = Column(String(100), default="None")
    waste_cost = Column(Float, default=0.0)
    status = Column(String(50), default="Active")  # Active, Consumed, Expired, Wasted

    product = relationship("Product", back_populates="batches")

class ForecastCache(Base):
    __tablename__ = "forecast_cache"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(50), ForeignKey("products.product_id"), nullable=False, index=True)
    forecast_date = Column(Date, nullable=False)
    model_name = Column(String(50), nullable=False)  # Holt-Winters, Moving Average, Naive Seasonal
    horizon_days = Column(Integer, nullable=False)  # 7 or 14
    forecasted_demand = Column(Float, nullable=False)
    lower_bound = Column(Float, default=0.0)
    upper_bound = Column(Float, default=0.0)
    mae = Column(Float, default=0.0)
    rmse = Column(Float, default=0.0)
    mape = Column(Float, default=0.0)
    accuracy_score = Column(Float, default=0.0)
    is_best_model = Column(Boolean, default=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="forecasts")

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    currency = Column(String(10), default="LKR")
    default_safety_stock_pct = Column(Float, default=15.0)
    default_lead_time_days = Column(Integer, default=2)
    alert_days_urgent = Column(Integer, default=1)
    alert_days_warning = Column(Integer, default=3)
    alert_days_notice = Column(Integer, default=7)
    co2_factor_food_waste = Column(Float, default=2.5)  # 2.5 kg CO2e per kg food waste
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    product_id = Column(String(50), nullable=True)
    severity = Column(String(50), default="info")  # info, warning, critical
    potential_savings_lkr = Column(Float, default=0.0)
    action_type = Column(String(100), default="recommendation")  # reduce_order, adjust_safety_stock, apply_discount, general
    action_payload = Column(Text, nullable=True)  # JSON or parameter string
    is_dismissed = Column(Boolean, default=False)
    is_applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class BatchDiscountRecord(Base):
    __tablename__ = "batch_discounts"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(100), nullable=False, index=True)
    product_id = Column(String(50), nullable=False, index=True)
    original_price = Column(Float, nullable=False)
    discount_pct = Column(Float, nullable=False)
    discounted_price = Column(Float, nullable=False)
    expected_units_sold = Column(Float, default=0.0)
    recovered_revenue_lkr = Column(Float, default=0.0)
    salvage_loss_avoided_lkr = Column(Float, default=0.0)
    is_applied = Column(Boolean, default=False)
    applied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DonationPartner(Base):
    __tablename__ = "donation_partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    partner_type = Column(String(100), default="Food Bank / NGO")
    is_active = Column(Boolean, default=True)
    total_meals_received = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class DonationRecord(Base):
    __tablename__ = "donation_records"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(100), nullable=True)
    product_id = Column(String(50), nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="units")
    estimated_value_lkr = Column(Float, default=0.0)
    recipient_ngo = Column(String(255), nullable=False)
    date = Column(Date, nullable=False, index=True)
    receipt_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WasteGoal(Base):
    __tablename__ = "waste_goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    goal_type = Column(String(50), nullable=False)  # reduce_waste_pct, save_cost_lkr, meals_donated, co2_avoided
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    baseline_value = Column(Float, default=0.0)
    unit = Column(String(50), default="%")
    start_date = Column(Date, nullable=False)
    target_date = Column(Date, nullable=False)
    status = Column(String(50), default="on_track")  # on_track, at_risk, achieved, behind
    projected_completion_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EventCalendar(Base):
    __tablename__ = "event_calendar"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    event_type = Column(String(50), default="poya")  # poya, festival, national_holiday, local_promo, weather_alert
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False)
    demand_lift_pct = Column(Float, default=0.0)
    affected_categories = Column(String(255), default="All")  # Comma-separated or 'All'
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True, index=True)
    condition = Column(String(50), default="Sunny")  # Sunny, Rainy, Monsoon Thunderstorm
    rainfall_mm = Column(Float, default=0.0)
    temp_c = Column(Float, default=30.0)
    demand_impact_multiplier = Column(Float, default=1.0)

class NotificationItem(Base):
    __tablename__ = "notification_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="Alert")  # Alert, Insight, Goal, System
    link_url = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Outlet(Base):
    __tablename__ = "outlets"

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(100), default="Colombo")
    address = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="Produce")
    contact_name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    lead_time_days = Column(Integer, default=2)
    on_time_delivery_pct = Column(Float, default=95.0)
    quality_score = Column(Float, default=9.2)  # Out of 10
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SupplierPriceHistory(Base):
    __tablename__ = "supplier_price_history"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(String(50), nullable=False, index=True)
    product_id = Column(String(50), nullable=False, index=True)
    price = Column(Float, nullable=False)
    effective_date = Column(Date, nullable=False, index=True)

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    dish_product_id = Column(String(50), nullable=False, unique=True, index=True)
    dish_name = Column(String(255), nullable=False)
    category = Column(String(100), default="Cooked Meals")
    yield_portions = Column(Integer, default=1)
    prep_time_mins = Column(Integer, default=15)
    instructions = Column(Text, nullable=True)

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False, index=True)
    ingredient_product_id = Column(String(50), nullable=False, index=True)
    ingredient_name = Column(String(255), nullable=False)
    quantity_per_portion = Column(Float, nullable=False)
    unit = Column(String(50), default="kg")

