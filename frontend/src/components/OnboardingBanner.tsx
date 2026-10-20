import React, { useState } from 'react';
import { UploadCloud, TrendingUp, ShoppingCart, ShieldCheck, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OnboardingBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('foodsense_onboarding_dismissed') === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('foodsense_onboarding_dismissed', 'true');
    setDismissed(true);
  };

  const steps = [
    {
      num: '1',
      title: 'Upload Data',
      desc: 'Import daily sales & expiry batches via CSV/XLSX or use seeded Sri Lankan sample dataset.',
      icon: UploadCloud,
      link: '/upload',
    },
    {
      num: '2',
      title: 'AI Forecast',
      desc: 'Holt-Winters weekly model automatically selects best model with confidence intervals.',
      icon: TrendingUp,
      link: '/forecasts',
    },
    {
      num: '3',
      title: 'Order Replenishment',
      desc: 'Get exact order quantities rounded to supplier packs, factoring lead times & safety buffers.',
      icon: ShoppingCart,
      link: '/recommendations',
    },
    {
      num: '4',
      title: 'Eliminate Waste',
      desc: 'Track expiry risks, monitor KPIs, and simulate bottom-line cost & CO2 savings.',
      icon: ShieldCheck,
      link: '/reports',
    },
  ];

  return (
    <div className="relative p-5 mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-brand-900 to-slate-900 text-white shadow-lg border border-brand-800/40">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 mb-1.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span>Welcome to FoodSense</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            Automated Demand Forecasting & Perishable Food Waste Prevention
          </h2>
          <p className="text-xs text-emerald-200/80 max-w-2xl">
            Designed for Sri Lankan restaurants and supermarkets to replace guesswork ordering with statistical machine learning.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-emerald-300/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Dismiss onboarding banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {steps.map((s, idx) => (
          <Link
            key={idx}
            to={s.link}
            className="group flex flex-col p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-400/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                {s.num}
              </span>
              <s.icon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1 flex items-center justify-between">
              <span>{s.title}</span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-emerald-300" />
            </h4>
            <p className="text-[11px] text-emerald-200/70 leading-relaxed">
              {s.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};
