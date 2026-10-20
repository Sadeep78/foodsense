import React from 'react';
import {
  Trash2,
  Coins,
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  Leaf,
  Percent,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { KPICardData } from '../../types';
import { DeltaChip } from './DeltaChip';

export interface KpiCardProps {
  data: KPICardData;
  className?: string;
  currency?: string;
}

const iconMap: Record<string, React.ElementType> = {
  Trash2,
  Coins,
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  Leaf,
  Percent,
  Layers,
};

// Scaled and strictly bounded micro-sparkline
const renderSparkline = (
  direction: 'up' | 'down' | 'neutral',
  isPositive: boolean
) => {
  // If neutral or no series trend, do not render a misleading line
  if (direction === 'neutral') {
    return null;
  }

  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';

  // Strictly scaled path within viewBox 0 0 36 14 (x: 2 to 34, y: 3 to 11)
  const linePath =
    direction === 'up'
      ? 'M 2 11 C 10 10, 16 8, 24 5 S 30 3, 34 3'
      : 'M 2 3 C 10 4, 16 6, 24 9 S 30 11, 34 11';

  const areaPath =
    direction === 'up'
      ? 'M 2 11 C 10 10, 16 8, 24 5 S 30 3, 34 3 L 34 14 L 2 14 Z'
      : 'M 2 3 C 10 4, 16 6, 24 9 S 30 11, 34 11 L 34 14 L 2 14 Z';

  return (
    <div className="w-8 sm:w-9 h-4 overflow-hidden shrink-0 flex items-center justify-end">
      <svg
        className="w-8 sm:w-9 h-4 overflow-hidden"
        viewBox="0 0 36 14"
        fill="none"
        preserveAspectRatio="none"
      >
        <path d={areaPath} fill={fillColor} />
        <path
          d={linePath}
          stroke={strokeColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// Formats KPI numbers compactly into single-line displays
export const formatCompactKpiValue = (
  value: string,
  numericValue?: number,
  title?: string,
  currency: string = 'LKR'
): { prefix?: string; main: string; suffix?: string; fullText: string } => {
  const num = numericValue !== undefined ? numericValue : parseFloat(value.replace(/[^0-9.-]/g, ''));

  if (isNaN(num)) {
    return { main: value, fullText: value };
  }

  const titleLower = (title || '').toLowerCase();
  const isCurrency =
    titleLower.includes('cost') ||
    titleLower.includes('saving') ||
    value.includes(currency) ||
    value.includes('Rs') ||
    value.includes('$');

  // 1. Currency amounts (Total Cost of Waste, Cost Savings)
  if (isCurrency) {
    if (num >= 1_000_000) {
      return {
        prefix: currency,
        main: (num / 1_000_000).toFixed(2),
        suffix: 'M',
        fullText: `${currency} ${num.toLocaleString()}`,
      };
    }
    if (num >= 1_000) {
      return {
        prefix: currency,
        main: (num / 1_000).toFixed(1),
        suffix: 'k',
        fullText: `${currency} ${num.toLocaleString()}`,
      };
    }
    return {
      prefix: currency,
      main: Math.round(num).toLocaleString(),
      fullText: `${currency} ${num.toLocaleString()}`,
    };
  }

  // 2. Carbon weights (CO2 Avoided)
  if (titleLower.includes('co2') || titleLower.includes('carbon') || value.toLowerCase().includes('kg')) {
    if (num >= 1_000) {
      return {
        main: (num / 1_000).toFixed(2),
        suffix: 't',
        fullText: `${num.toLocaleString()} kg CO2e`,
      };
    }
    return {
      main: Math.round(num).toLocaleString(),
      suffix: 'kg',
      fullText: `${num.toLocaleString()} kg CO2e`,
    };
  }

  // 3. Percentages (Food Waste Rate, Forecast Accuracy)
  if (value.includes('%') || titleLower.includes('percentage') || titleLower.includes('rate') || titleLower.includes('accuracy')) {
    return {
      main: num.toFixed(1),
      suffix: '%',
      fullText: `${num.toFixed(1)}%`,
    };
  }

  // 4. Batches count
  if (titleLower.includes('batch') || value.toLowerCase().includes('batch')) {
    return {
      main: Math.round(num).toString(),
      suffix: 'Batches',
      fullText: `${Math.round(num)} Batches`,
    };
  }

  return { main: value, fullText: value };
};

const DISPLAY_LABELS: Record<string, string> = {
  'Food Waste Percentage': 'Food Waste Rate',
  'Total Cost of Waste': 'Total Waste Cost',
  'Model Forecast Accuracy': 'Forecast Accuracy',
  'Estimated Cost Savings (Est.)': 'Cost Savings',
  'Estimated Cost Savings': 'Cost Savings',
  'Batches Expiring Soon': 'Expiring Batches',
  'Batches Expiring (7d)': 'Expiring Batches',
  'Estimated CO2 Avoided (Est.)': 'CO2e Avoided',
  'Estimated CO2 Avoided': 'CO2e Avoided',
};

const DEFAULT_TOOLTIPS: Record<string, string> = {
  'Food Waste Percentage': 'Formula: (Total Wasted Stock Value / Total Received Stock Value) × 100.',
  'Total Cost of Waste': 'Formula: Sum of (Quantity Wasted × Unit Cost) across all recorded batches in LKR.',
  'Model Forecast Accuracy': 'Formula: 100% - MAPE (Mean Absolute Percentage Error) evaluated on weekly rolling test horizons.',
  'Estimated Cost Savings (Est.)': 'Formula: Baseline Waste Cost (12.5% unassisted procurement) - Actual Spoilage Cost in LKR.',
  'Batches Expiring Soon': 'Perishable batches nearing expiration date within the next 7 days requiring salvage markdown or donation.',
  'Estimated CO2 Avoided (Est.)': 'Formula: Avoided Food Waste (kg) × 2.5 kg CO2e/kg (IPCC Waste Model / Sri Lanka CEA standard).',
};

export const KpiCard: React.FC<KpiCardProps> = ({ data, className = '', currency = 'LKR' }) => {
  const IconComponent = iconMap[data.icon_name] || TrendingUp;

  // Semantic color styling for icon backdrop
  const getIconAccent = (iconName: string) => {
    switch (iconName) {
      case 'Trash2':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 border-rose-100 dark:border-rose-900/40';
      case 'Coins':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900/40';
      case 'TrendingUp':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-900/40';
      case 'PiggyBank':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40';
      case 'AlertTriangle':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/50 dark:text-orange-400 border-orange-100 dark:border-orange-900/40';
      case 'Leaf':
        return 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 dark:text-teal-400 border-teal-100 dark:border-teal-900/40';
      default:
        return 'text-brand-600 bg-brand-50 dark:bg-brand-950/50 dark:text-brand-400 border-brand-100 dark:border-brand-900/40';
    }
  };

  const displayTitle = DISPLAY_LABELS[data.title] || data.title;
  const tooltipText = data.tooltip || DEFAULT_TOOLTIPS[data.title];

  // Clean formatted comparison string (compact for tight grids)
  let comparisonLabel = data.trend_label || data.subtext || '';
  if (/previous\s*90/i.test(comparisonLabel)) {
    comparisonLabel = 'vs 90d';
  } else if (/previous\s*period/i.test(comparisonLabel)) {
    comparisonLabel = 'vs prior';
  } else if (/weekly\s*baseline/i.test(comparisonLabel)) {
    comparisonLabel = 'vs base';
  } else if (/unassisted/i.test(comparisonLabel)) {
    comparisonLabel = 'vs base';
  } else if (/ipcc/i.test(comparisonLabel)) {
    comparisonLabel = 'vs IPCC';
  }

  // Handle neutral / informational cards like Expiring Batches
  const isNeutralCard =
    data.trend_direction === 'neutral' ||
    data.trend_pct === 0 ||
    data.title.toLowerCase().includes('expiring');

  // Format compact single-line value
  const compactVal = formatCompactKpiValue(
    data.value,
    data.numeric_value,
    data.title,
    data.unit && data.unit !== '%' && data.unit !== 'batches' ? data.unit : currency
  );

  // Clean up at risk text for neutral pill
  let atRiskText = '';
  let fullAtRiskTooltip = data.subtext || '';
  if (isNeutralCard) {
    if (data.subtext && data.subtext.toLowerCase().includes('risk')) {
      const match = data.subtext.match(/[\d,]+/);
      if (match) {
        const rawNum = parseFloat(match[0].replace(/,/g, ''));
        const compactAmt = rawNum >= 1000 ? `${(rawNum / 1000).toFixed(0)}k` : `${rawNum}`;
        atRiskText = `${currency} ${compactAmt} at risk`;
        fullAtRiskTooltip = `Value at risk: ${currency} ${rawNum.toLocaleString()}`;
      } else {
        atRiskText = data.subtext.replace(/^vs\s*/i, '').trim();
      }
    } else {
      atRiskText = `${compactVal.prefix || currency} at risk`;
    }
  }

  return (
    <div
      className={`relative flex flex-col justify-between h-[162px] min-h-[162px] p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 dark:bg-slate-900 dark:border-slate-800/90 overflow-hidden ${className}`}
    >
      {/* 1. Header Row (Label + Tooltip on left, Icon on right) */}
      <div className="h-10 flex items-start justify-between gap-1.5 shrink-0">
        <div className="flex items-start gap-1 min-w-0 flex-1">
          <span
            className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 leading-snug line-clamp-2"
            title={data.title}
          >
            {displayTitle}
          </span>

          {tooltipText && (
            <div className="relative group/tip shrink-0 mt-0.5">
              <button
                type="button"
                aria-label={`Formula details for ${displayTitle}`}
                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tip:block group-focus-within/tip:block z-30 w-64 p-2.5 text-[11px] leading-relaxed text-slate-100 bg-slate-900 dark:bg-slate-800 rounded-xl shadow-xl border border-slate-700/80 pointer-events-none">
                <span className="font-bold text-emerald-400 block mb-1">{data.title}</span>
                {tooltipText}
              </div>
            </div>
          )}
        </div>

        <div
          className={`p-1.5 rounded-xl border shrink-0 ${getIconAccent(
            data.icon_name
          )}`}
        >
          <IconComponent className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 2. Middle Row: Single-line Compact Value + Scaled Sparkline */}
      <div className="my-auto py-1 flex items-baseline justify-between gap-1 min-w-0">
        <div
          className="flex items-baseline min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
          title={compactVal.fullText}
        >
          {compactVal.prefix && (
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mr-0.5 shrink-0">
              {compactVal.prefix}
            </span>
          )}
          <span className="text-base sm:text-[19px] 2xl:text-[21px] font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {compactVal.main}
          </span>
          {compactVal.suffix && (
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 ml-0.5 shrink-0">
              {compactVal.suffix}
            </span>
          )}
        </div>

        {renderSparkline(data.trend_direction, data.is_positive_trend)}
      </div>

      {/* 3. Footer Row: DeltaChip or Neutral Chip Pill */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between min-h-[28px] overflow-hidden shrink-0">
        {isNeutralCard ? (
          <div className="inline-flex items-center min-w-0 max-w-full overflow-hidden">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border tabular-nums bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50 truncate max-w-full"
              title={fullAtRiskTooltip}
            >
              {atRiskText}
            </span>
          </div>
        ) : (
          <DeltaChip
            value={data.trend_pct}
            direction={data.trend_direction}
            isPositiveTrend={data.is_positive_trend}
            comparisonLabel={comparisonLabel}
            size="sm"
          />
        )}
      </div>
    </div>
  );
};

export const KpiCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative flex flex-col justify-between h-[162px] min-h-[162px] p-3.5 sm:p-4 bg-white border border-slate-200/90 rounded-2xl shadow-card dark:bg-slate-900 dark:border-slate-800/90 animate-pulse overflow-hidden ${className}`}
    >
      <div className="h-10 flex items-start justify-between gap-2.5">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
        <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
      </div>
      <div className="my-auto py-1 flex items-baseline justify-between gap-2">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-12" />
      </div>
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between min-h-[28px]">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-14" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-16" />
      </div>
    </div>
  );
};
