import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface ChartCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  actions,
  footer,
  children,
  isLoading = false,
  className = '',
}) => {
  return (
    <div
      className={`relative p-5 bg-white border border-slate-200/90 rounded-2xl shadow-card dark:bg-slate-900 dark:border-slate-800/90 flex flex-col justify-between ${className}`}
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Main Chart Canvas / Skeleton */}
      <div className="relative flex-1 w-full min-h-[220px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
            <RefreshCw className="w-5 h-5 text-brand-600 animate-spin mb-2" />
            <span className="text-xs text-slate-400">Loading chart data...</span>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Optional Footnote / Insight Banner */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {footer}
        </div>
      )}
    </div>
  );
};
