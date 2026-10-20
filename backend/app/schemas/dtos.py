from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    email: str
    business_type: str
    currency: str
    role: Optional[str] = "Manager"

class UserProfile(BaseModel):
    email: str
    full_name: str
    role: str
    business_name: str
    business_type: str
    currency: str
    outlet_name: str
    address: str

class UserProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    currency: Optional[str] = None
    outlet_name: Optional[str] = None
    address: Optional[str] = None

# Product schemas
class ProductOut(BaseModel):
    product_id: str
    name: str
    category: str
    unit: str
    unit_price: float
    unit_cost: float
    shelf_life_days: int
    lead_time_days: int
    safety_stock_pct: float
    pack_size: int
    current_stock: float = 0.0

    model_config = ConfigDict(from_attributes=True)

class ProductUpdate(BaseModel):
    lead_time_days: Optional[int] = None
    safety_stock_pct: Optional[float] = None
    pack_size: Optional[int] = None
    shelf_life_days: Optional[int] = None

# Upload & Validation schemas
class ValidationIssue(BaseModel):
    row: int
    column: str
    value: Any
    message: str
    severity: str = "error"  # "error" or "warning"

class UploadValidationResult(BaseModel):
    valid: bool
    total_rows: int
    valid_rows: int
    error_count: int
    warning_count: int
    issues: List[ValidationIssue]
    preview_data: List[Dict[str, Any]]
    dataset_type: str  # "sales" or "inventory"

class ConfirmUploadRequest(BaseModel):
    dataset_type: str
    rows: List[Dict[str, Any]]

class UploadResponse(BaseModel):
    success: bool
    message: str
    rows_imported: int
    recalculated_forecasts: bool = True

# Forecasting schemas
class ModelEvaluationMetric(BaseModel):
    model_name: str
    mae: float
    rmse: float
    mape: float
    accuracy_score: float
    is_best: bool
    description: str

class ForecastDataPoint(BaseModel):
    date: str
    day_name: str
    historical_sales: Optional[float] = None
    forecast: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class ProductForecastResponse(BaseModel):
    product_id: str
    product_name: str
    category: str
    unit: str
    unit_price: float
    unit_cost: float
    best_model: str
    models_evaluated: List[ModelEvaluationMetric]
    chart_data: List[ForecastDataPoint]
    horizon_days: int
    total_forecast_demand: float
    avg_daily_demand: float
    has_sparse_history: bool = False
    warning: Optional[str] = None

class ForecastSummaryItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    best_model: str
    accuracy_score: float
    next_7_day_demand: float
    next_14_day_demand: float
    stock_status: str

# Ordering Recommendations schemas
class RecommendationItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    unit: str
    current_usable_stock: float
    expiring_soon_stock: float
    lead_time_days: int
    safety_stock_pct: float
    pack_size: int
    forecasted_demand_lead_time: float
    safety_stock_qty: float
    gross_requirement: float
    recommended_order: int
    unit_cost: float
    estimated_order_cost: float
    priority: str  # Urgent, Normal, Skip
    reason: str

class RecommendationResponse(BaseModel):
    total_products: int
    urgent_orders_count: int
    total_estimated_spend: float
    currency: str
    recommendations: List[RecommendationItem]

# Expiry Alerts schemas
class ExpiryAlertItem(BaseModel):
    id: int
    batch_id: str
    product_id: str
    product_name: str
    category: str
    unit: str
    current_quantity: float
    expiry_date: str
    days_until_expiry: int
    urgency: str  # "critical" (<=1 day), "warning" (2-3 days), "notice" (4-7 days)
    unit_cost: float
    value_at_risk: float
    suggested_actions: List[str]

class ExpiryAlertSummary(BaseModel):
    critical_count: int
    warning_count: int
    notice_count: int
    total_value_at_risk: float
    currency: str
    alerts: List[ExpiryAlertItem]

# KPI schemas
class KPICardData(BaseModel):
    title: str
    value: str
    numeric_value: float
    unit: Optional[str] = ""
    trend_pct: float
    trend_direction: str  # "up", "down", "neutral"
    is_positive_trend: bool
    subtext: str
    icon_name: str
    tooltip: Optional[str] = None
    is_estimate: bool = False

class SalesVsForecastPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    forecast: Optional[float] = None
    lower: Optional[float] = None
    upper: Optional[float] = None

class WasteTrendPoint(BaseModel):
    month: str
    waste_cost: float
    waste_quantity: float
    sales_cost: float

class CategoryWastePoint(BaseModel):
    category: str
    cost: float
    quantity: float
    percentage: float

class TopWastedItem(BaseModel):
    product_name: str
    category: str
    waste_quantity: float
    waste_cost: float
    unit: str

class WasteReasonPoint(BaseModel):
    reason: str
    cost: float
    percentage: float

class HeatmapCell(BaseModel):
    day: str  # Mon, Tue, etc.
    hour_bucket: Optional[str] = "All Day"
    demand_index: float  # Normalized 0-100
    avg_sales_qty: float

class BeforeAfterComparisonPoint(BaseModel):
    metric: str
    before_foodsense: float
    after_foodsense: float
    reduction_pct: float
    unit: str

class DashboardKPIResponse(BaseModel):
    cards: List[KPICardData]
    sales_vs_forecast: List[SalesVsForecastPoint]
    waste_trends: List[WasteTrendPoint]
    waste_by_category: List[CategoryWastePoint]
    top_wasted_products: List[TopWastedItem]
    waste_by_reason: List[WasteReasonPoint]
    demand_heatmap: List[HeatmapCell]
    before_after_simulation: List[BeforeAfterComparisonPoint]
    insights: List[str]
    currency: str

# Waste Report & What-if schemas
class WasteReportItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    total_received: float
    total_sold: float
    total_wasted: float
    waste_percentage: float
    waste_cost: float
    primary_reason: str
    unit: str

class WasteReportResponse(BaseModel):
    total_received_cost: float
    total_waste_cost: float
    overall_waste_pct: float
    co2_emissions_kg: float
    items: List[WasteReportItem]
    currency: str

class WhatIfSimRequest(BaseModel):
    ordering_compliance_pct: float = 80.0  # Slider 0-100%
    markdown_discount_pct: float = 30.0   # Discount applied on expiring items

class WhatIfSimResponse(BaseModel):
    baseline_waste_cost: float
    projected_waste_cost: float
    estimated_savings_lkr: float
    co2_avoided_kg: float
    waste_reduction_pct: float
    roi_multiple: float
    narrative: str

# Settings schemas
class SettingsDTO(BaseModel):
    business_name: str
    business_type: str
    currency: str
    outlet_name: str
    address: str
    default_safety_stock_pct: float
    default_lead_time_days: int
    alert_days_urgent: int
    alert_days_warning: int
    alert_days_notice: int
    co2_factor_food_waste: float

class SettingsUpdate(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    currency: Optional[str] = None
    outlet_name: Optional[str] = None
    address: Optional[str] = None
    default_safety_stock_pct: Optional[float] = None
    default_lead_time_days: Optional[int] = None
    alert_days_urgent: Optional[int] = None
    alert_days_warning: Optional[int] = None
    alert_days_notice: Optional[int] = None
    co2_factor_food_waste: Optional[float] = None

# Phase A: Insights Engine DTOs
class InsightResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    product_id: Optional[str] = None
    severity: str  # "info", "warning", "critical"
    potential_savings_lkr: float
    action_type: str
    action_payload: Optional[str] = None
    is_dismissed: bool
    is_applied: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InsightSummaryResponse(BaseModel):
    total_potential_savings: float
    critical_count: int
    warning_count: int
    info_count: int
    insights: List[InsightResponse]

class InsightActionRequest(BaseModel):
    action: str = "apply"  # "apply" or "dismiss"

# Phase A: Dynamic Markdown & Discount DTOs
class DiscountSuggestionItem(BaseModel):
    batch_id: str
    product_id: str
    product_name: str
    category: str
    days_to_expiry: int
    current_quantity: float
    unit: str
    original_price: float
    suggested_discount_pct: float
    suggested_price: float
    expected_units_sold: float
    projected_recovered_revenue: float
    salvage_loss_avoided: float
    elasticity_score: float
    recommendation_text: str

class DiscountSuggestionResponse(BaseModel):
    total_batches_at_risk: int
    total_potential_recovery_lkr: float
    suggestions: List[DiscountSuggestionItem]

class ApplyDiscountRequest(BaseModel):
    batch_id: str
    discount_pct: float
    discounted_price: float
    recovered_estimate: float

# Phase A: Donation & Redistribution DTOs
class DonationPartnerCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    partner_type: str = "Charity / Food Bank"

class DonationPartnerResponse(BaseModel):
    id: int
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    partner_type: str
    is_active: bool
    total_meals_received: int

    model_config = ConfigDict(from_attributes=True)

class DonationRecordCreate(BaseModel):
    batch_id: Optional[str] = None
    product_id: str
    product_name: str
    quantity: float
    unit: str = "units"
    estimated_value_lkr: float
    recipient_ngo: str
    date: Optional[date] = None
    receipt_note: Optional[str] = None

class DonationRecordResponse(BaseModel):
    id: int
    batch_id: Optional[str] = None
    product_id: str
    product_name: str
    quantity: float
    unit: str
    estimated_value_lkr: float
    recipient_ngo: str
    date: date
    receipt_note: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DonationsOverviewResponse(BaseModel):
    total_meals_donated: int
    total_kg_diverted: float
    total_value_lkr: float
    partner_count: int
    recent_donations: List[DonationRecordResponse]
    partners: List[DonationPartnerResponse]

# Phase A: Waste Goals DTOs
class WasteGoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    goal_type: str  # reduce_waste_pct, save_cost_lkr, meals_donated, co2_avoided
    target_value: float
    baseline_value: float = 0.0
    unit: str = "%"
    start_date: date
    target_date: date

class WasteGoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    target_date: Optional[date] = None
    status: Optional[str] = None

class WasteGoalResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    goal_type: str
    target_value: float
    current_value: float
    baseline_value: float
    unit: str
    start_date: date
    target_date: date
    status: str  # on_track, at_risk, achieved, behind
    progress_pct: float
    projected_completion_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)

