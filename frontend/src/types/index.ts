export interface User {
  email: string;
  user_name: string;
  business_type: string;
  currency: string;
  role?: string;
}

export interface UserProfile {
  email: string;
  full_name: string;
  role: string;
  business_name: string;
  business_type: string;
  currency: string;
  outlet_name: string;
  address: string;
}

export interface Product {
  product_id: string;
  name: string;
  category: string;
  unit: string;
  unit_price: number;
  unit_cost: number;
  shelf_life_days: number;
  lead_time_days: number;
  safety_stock_pct: number;
  pack_size: number;
  current_stock: number;
}

export interface KPICardData {
  title: string;
  value: string;
  numeric_value: number;
  unit?: string;
  trend_pct: number;
  trend_direction: 'up' | 'down' | 'neutral';
  is_positive_trend: boolean;
  subtext: string;
  trend_label?: string;
  icon_name: string;
  tooltip?: string;
  is_estimate?: boolean;
}

export interface SalesVsForecastPoint {
  date: string;
  actual?: number | null;
  forecast?: number | null;
  lower?: number | null;
  upper?: number | null;
}

export interface WasteTrendPoint {
  month: string;
  waste_cost: number;
  waste_quantity: number;
  sales_cost: number;
}

export interface CategoryWastePoint {
  category: string;
  cost: number;
  quantity: number;
  percentage: number;
}

export interface TopWastedItem {
  product_name: string;
  category: string;
  waste_quantity: number;
  waste_cost: number;
  unit: string;
}

export interface WasteReasonPoint {
  reason: string;
  cost: number;
  percentage: number;
}

export interface HeatmapCell {
  day: string;
  hour_bucket?: string;
  demand_index: number;
  avg_sales_qty: number;
}

export interface BeforeAfterComparisonPoint {
  metric: string;
  before_foodsense: number;
  after_foodsense: number;
  reduction_pct: number;
  unit: string;
}

export interface DashboardKPIResponse {
  cards: KPICardData[];
  sales_vs_forecast: SalesVsForecastPoint[];
  waste_trends: WasteTrendPoint[];
  waste_by_category: CategoryWastePoint[];
  top_wasted_products: TopWastedItem[];
  waste_by_reason: WasteReasonPoint[];
  demand_heatmap: HeatmapCell[];
  before_after_simulation: BeforeAfterComparisonPoint[];
  insights: string[];
  currency: string;
}

export interface ModelEvaluationMetric {
  model_name: string;
  mae: number;
  rmse: number;
  mape: number;
  accuracy_score: number;
  is_best: boolean;
  description: string;
}

export interface ForecastDataPoint {
  date: string;
  day_name: string;
  historical_sales?: number | null;
  forecast?: number | null;
  lower_bound?: number | null;
  upper_bound?: number | null;
}

export interface ProductForecastResponse {
  product_id: string;
  product_name: string;
  category: string;
  unit: string;
  unit_price: number;
  unit_cost: number;
  best_model: string;
  models_evaluated: ModelEvaluationMetric[];
  chart_data: ForecastDataPoint[];
  horizon_days: number;
  total_forecast_demand: number;
  avg_daily_demand: number;
  has_sparse_history: boolean;
  warning?: string | null;
}

export interface ForecastSummaryItem {
  product_id: string;
  product_name: string;
  category: string;
  best_model: string;
  accuracy_score: number;
  next_7_day_demand: number;
  next_14_day_demand: number;
  stock_status: string;
}

export interface RecommendationItem {
  product_id: string;
  product_name: string;
  category: string;
  unit: string;
  current_usable_stock: number;
  expiring_soon_stock: number;
  lead_time_days: number;
  safety_stock_pct: number;
  pack_size: number;
  forecasted_demand_lead_time: number;
  safety_stock_qty: number;
  gross_requirement: number;
  recommended_order: number;
  unit_cost: number;
  estimated_order_cost: number;
  priority: 'Urgent' | 'Normal' | 'Skip';
  reason: string;
}

export interface RecommendationResponse {
  total_products: number;
  urgent_orders_count: number;
  total_estimated_spend: number;
  currency: string;
  recommendations: RecommendationItem[];
}

export interface ExpiryAlertItem {
  id: number;
  batch_id: string;
  product_id: string;
  product_name: string;
  category: string;
  unit: string;
  current_quantity: number;
  expiry_date: string;
  days_until_expiry: number;
  urgency: 'critical' | 'warning' | 'notice';
  unit_cost: number;
  value_at_risk: number;
  suggested_actions: string[];
}

export interface ExpiryAlertSummary {
  critical_count: number;
  warning_count: number;
  notice_count: number;
  total_value_at_risk: number;
  currency: string;
  alerts: ExpiryAlertItem[];
}

export interface ValidationIssue {
  row: number;
  column: string;
  value: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface UploadValidationResult {
  valid: boolean;
  total_rows: number;
  valid_rows: number;
  error_count: number;
  warning_count: number;
  issues: ValidationIssue[];
  preview_data: any[];
  dataset_type: 'sales' | 'inventory';
}

export interface WasteReportItem {
  product_id: string;
  product_name: string;
  category: string;
  total_received: number;
  total_sold: number;
  total_wasted: number;
  waste_percentage: number;
  waste_cost: number;
  primary_reason: string;
  unit: string;
}

export interface WasteReportResponse {
  total_received_cost: number;
  total_waste_cost: number;
  overall_waste_pct: number;
  co2_emissions_kg: number;
  items: WasteReportItem[];
  currency: string;
}

export interface WhatIfResponse {
  baseline_waste_cost: number;
  projected_waste_cost: number;
  estimated_savings_lkr: number;
  co2_avoided_kg: number;
  waste_reduction_pct: number;
  roi_multiple: number;
  narrative: string;
}

export interface SettingsData {
  business_name: string;
  business_type: string;
  currency: string;
  outlet_name: string;
  address: string;
  default_safety_stock_pct: number;
  default_lead_time_days: number;
  alert_days_urgent: number;
  alert_days_warning: number;
  alert_days_notice: number;
  co2_factor_food_waste: number;
}

// Phase A: Insights Engine Types
export interface InsightItem {
  id: number;
  title: string;
  description: string;
  category: string;
  product_id?: string | null;
  severity: 'info' | 'warning' | 'critical';
  potential_savings_lkr: number;
  action_type: string;
  action_payload?: string | null;
  is_dismissed: boolean;
  is_applied: boolean;
  created_at: string;
}

export interface InsightSummaryResponse {
  total_potential_savings: number;
  critical_count: number;
  warning_count: number;
  info_count: number;
  insights: InsightItem[];
}

// Phase A: Dynamic Markdown & Discount Types
export interface DiscountSuggestionItem {
  batch_id: string;
  product_id: string;
  product_name: string;
  category: string;
  days_to_expiry: number;
  current_quantity: number;
  unit: string;
  original_price: number;
  suggested_discount_pct: number;
  suggested_price: number;
  expected_units_sold: number;
  projected_recovered_revenue: number;
  salvage_loss_avoided: number;
  elasticity_score: number;
  recommendation_text: string;
}

export interface DiscountSuggestionResponse {
  total_batches_at_risk: number;
  total_potential_recovery_lkr: number;
  suggestions: DiscountSuggestionItem[];
}

// Phase A: Donation & Redistribution Types
export interface DonationPartner {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  partner_type: string;
  is_active: boolean;
  total_meals_received: number;
}

export interface DonationRecord {
  id: number;
  batch_id?: string | null;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  estimated_value_lkr: number;
  recipient_ngo: string;
  date: string;
  receipt_note?: string;
  created_at: string;
}

export interface DonationsOverviewResponse {
  total_meals_donated: number;
  total_kg_diverted: number;
  total_value_lkr: number;
  partner_count: number;
  recent_donations: DonationRecord[];
  partners: DonationPartner[];
}

// Phase A: Waste Goals Types
export interface WasteGoal {
  id: number;
  title: string;
  description?: string;
  goal_type: 'reduce_waste_pct' | 'save_cost_lkr' | 'meals_donated' | 'co2_avoided' | string;
  target_value: number;
  current_value: number;
  baseline_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: 'on_track' | 'at_risk' | 'achieved' | 'behind';
  progress_pct: number;
  projected_completion_date?: string;
}

// Phase B: Weather & Event Impact Types
export interface EventCalendarItem {
  id: number;
  title: string;
  event_type: 'poya' | 'festival' | 'national_holiday' | 'local_promo' | 'weather_alert' | string;
  start_date: string;
  end_date: string;
  demand_lift_pct: number;
  affected_categories: string;
  is_custom: boolean;
}

export interface EventsImpactAnalysisResponse {
  accuracy_improvement_pct: number;
  uplift_by_event: Array<{
    event: string;
    lift_pct: number;
    category: string;
  }>;
  model_comparison: Array<{
    model_type: string;
    mape: number;
    accuracy_score: number;
    mae: number;
    event_aware: boolean;
    description: string;
  }>;
  total_events_tracked: number;
  upcoming_events: EventCalendarItem[];
  weather_forecast: Array<{
    date: string;
    condition: string;
    temp_c: number;
    rainfall_mm: number;
    multiplier: number;
  }>;
}

// Phase B: Forecast Explainability Types
export interface WaterfallPoint {
  date: string;
  day_name: string;
  baseline_mean: number;
  trend_component: number;
  seasonal_component: number;
  event_component: number;
  final_forecast: number;
}

export interface BenchmarkModel {
  model: string;
  mae: number;
  mape: number;
  accuracy_score: number;
  is_selected: boolean;
  strength: string;
}

export interface ForecastExplainabilityResponse {
  product_id: string;
  product_name: string;
  category: string;
  selected_model: string;
  overall_accuracy_score: number;
  directional_bias: {
    bias_direction: string;
    bias_pct: number;
    interpretation: string;
  };
  components_summary: {
    baseline_level: number;
    trend_slope: number;
    weekend_lift_pct: number;
    events_active_in_horizon: boolean;
  };
  waterfall_breakdown: WaterfallPoint[];
  benchmark_models: BenchmarkModel[];
}

// Phase B: Profit & Margin Analysis Types
export interface SKUMarginItem {
  product_id: string;
  product_name: string;
  category: string;
  unit: string;
  unit_price: number;
  unit_cost: number;
  quantity_sold: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  wasted_quantity: number;
  waste_cost: number;
  waste_rate_pct: number;
  net_profit_after_waste: number;
  net_margin_pct: number;
  quadrant: 'Star' | 'Cash Cow' | 'High Spoilage Risk' | 'Critical Attention' | string;
  quadrant_label: string;
  recommended_action: string;
  color: string;
}

export interface CategoryMarginItem {
  category: string;
  revenue: number;
  gross_profit: number;
  gross_margin_pct: number;
  waste_cost: number;
  net_profit: number;
  net_margin_pct: number;
}

export interface MarginAnalysisResponse {
  summary: {
    total_revenue: number;
    total_cogs: number;
    gross_profit: number;
    gross_margin_pct: number;
    total_waste_cost: number;
    net_profit_after_waste: number;
    net_margin_pct: number;
    waste_margin_erosion_pct: number;
  };
  quadrant_counts: {
    stars: number;
    cash_cows: number;
    high_risk: number;
    drainers: number;
  };
  category_summary: CategoryMarginItem[];
  sku_analysis: SKUMarginItem[];
}


