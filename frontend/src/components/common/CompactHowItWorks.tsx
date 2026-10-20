import React, { useState } from 'react';
import {
  UploadCloud,
  TrendingUp,
  ShoppingCart,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CompactHowItWorks: React.FC = () => {
  // If permanently dismissed
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('foodsense_how_it_works_dismissed') === 'true';
  });

  // Default to collapsed so KPIs and charts appear above the fold
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('foodsense_how_it_works_expanded');
    return saved === 'true'; // default false
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('foodsense_how_it_works_dismissed', 'true');
    setDismissed(true);
  };

  const handleToggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('foodsense_how_it_works_expanded', String(next));
      return next;
    });
  };

  const steps = [
    {
      num: '1',
      title: 'Upload Data',
      desc: 'Import daily sales & expiry batches via CSV/XLSX or sample seed.',
      icon: UploadCloud,
      link: '/upload',
    },
    {
      num: '2',
      title: 'AI Forecast',
      desc: 'Holt-Winters models with 28-day backtesting & confidence intervals.',
      icon: TrendingUp,
      link: '/forecasts',
    },
    {
      num: '3',
      title: 'Replenishment POs',
      desc: 'Get exact order quantities rounded to vendor packs with safety stock.',
      icon: ShoppingCart,
      link: '/recommendations',
    },
    {
      num: '4',
      title: 'Prevent Waste',
      desc: 'Track expiry risk, markdowns, charity donations & carbon avoided.',
      icon: ShieldCheck,
      link: '/sustainability',
    },
  ];

  return (
    <div className="relative mb-4 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-slate-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900/80 dark:border-emerald-800/40 shadow-xs transition-all duration-200">
      {/* Sleek Top Strip / Summary Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-900 dark:text-white">
              How FoodSense Works:
            </span>
            <span className="text-slate-600 dark:text-slate-300 hidden md:inline">
              1. Upload Data → 2. AI Demand Forecast → 3. Order Replenishment → 4. Eliminate Spoilage
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleExpand}
            aria-label={isExpanded ? 'Collapse how it works guide' : 'View how it works guide steps'}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-200/70 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900/80 rounded-lg transition-colors"
          >
            <span>{isExpanded ? 'Collapse' : 'View Steps'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss guide"
            title="Dismiss guide"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded 4-Step Horizontal Strip */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-emerald-100/80 dark:border-emerald-900/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
            {steps.map((s, idx) => (
              <Link
                key={idx}
                to={s.link}
                className="group flex flex-col p-2.5 rounded-xl bg-white/90 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 shadow-xs hover:border-emerald-400/50 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                    {s.num}
                  </span>
                  <s.icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center justify-between mb-0.5">
                  <span>{s.title}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {s.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
