import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface DeltaChipProps {
  value: number;
  direction?: 'up' | 'down' | 'neutral';
  isPositiveTrend?: boolean;
  comparisonLabel?: string;
  size?: 'sm' | 'md';
  unit?: string;
  className?: string;
}

export const DeltaChip: React.FC<DeltaChipProps> = ({
  value,
  direction = 'neutral',
  isPositiveTrend = true,
  comparisonLabel = 'vs previous 90 days',
  size = 'sm',
  unit = '%',
  className = '',
}) => {
  // Determine color styling based on isPositiveTrend
  // If neutral, show neutral gray
  // If positive trend (good outcome), show emerald
  // If negative trend (bad outcome), show rose
  const isNeutral = direction === 'neutral' || value === 0;

  const colorClasses = isNeutral
    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/80'
    : isPositiveTrend
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50'
    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50';

  const iconSizes = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const textSizes = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <div className={`inline-flex items-center gap-1.5 flex-nowrap min-w-0 max-w-full overflow-hidden ${className}`}>
      <span
        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold border tabular-nums shrink-0 ${colorClasses} ${textSizes}`}
      >
        {direction === 'up' && <ArrowUpRight className={iconSizes} />}
        {direction === 'down' && <ArrowDownRight className={iconSizes} />}
        {direction === 'neutral' && <Minus className={iconSizes} />}
        <span>
          {isNeutral && value === 0
            ? '0%'
            : `${value > 0 ? (direction === 'up' ? '+' : direction === 'down' ? '-' : '') : ''}${Math.abs(value)}${unit}`}
        </span>
      </span>

      {comparisonLabel && (
        <span
          className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap truncate min-w-0"
          title={comparisonLabel}
        >
          {comparisonLabel}
        </span>
      )}
    </div>
  );
};
