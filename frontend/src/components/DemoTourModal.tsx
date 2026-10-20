import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Leaf,
  Store,
  Heart,
  Award,
} from 'lucide-react';
import { Modal } from './common/Modal';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const tourSteps = [
    {
      title: 'Platform Overview: FoodSense Vision',
      badge: 'AI Demand & Waste Intelligence',
      icon: <Award className="w-6 h-6 text-emerald-500" />,
      content:
        'FoodSense addresses the multi-billion rupee food waste dilemma in Sri Lankan hospitality and supermarkets. By moving operators from guesswork to data-driven Holt-Winters forecasting, businesses reduce perishable losses by up to 48% while avoiding metric tons of greenhouse gas emissions.',
      highlight: 'Production-ready demand intelligence and waste analytics platform.',
      linkPath: '/',
      linkText: 'Explore Dashboard KPIs',
    },
    {
      title: 'Demand Forecasting with Weather & Event Regressors',
      badge: 'Holt-Winters + Sri Lankan Calendar',
      icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
      content:
        'Our statistical engine evaluates Naive, Moving Average, and Holt-Winters models over 28-day backtesting windows. Adding Sri Lankan Poya days, festival surges (Sinhala & Tamil New Year), and tropical monsoon rain patterns delivers a measured +7.8% accuracy uplift.',
      highlight: 'Explainability waterfall shows base level, day-of-week seasonality, and weather lift.',
      linkPath: '/forecasts',
      linkText: 'Inspect Forecast Engine',
    },
    {
      title: 'Dynamic Markdowns & Surplus Charity Redistribution',
      badge: 'Financial Recovery & Zero-Waste Protocol',
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      content:
        'Expiring inventory batches trigger price-elasticity discount suggestions to recover working capital before spoilage occurs. Surplus food nearing expiration can be dispatched to partner NGOs (Sahana Kitchen, Robin Hood Army) with single-tap tracking.',
      highlight: 'Recovers revenue while feeding local community food banks.',
      linkPath: '/alerts',
      linkText: 'View Salvage & Expiry Alerts',
    },
    {
      title: 'Multi-Outlet Benchmarks & Recipe BOM Explosion',
      badge: 'Enterprise Scalability',
      icon: <Store className="w-6 h-6 text-amber-500" />,
      content:
        'Multi-outlet intelligence ranks Colombo Central, Kandy Hillside, and Galle Fort branches on waste compliance and savings. Restaurant Mode explodes forecasted dish portions (Chicken Kottu, Rice & Curry) into raw ingredient purchase orders with safety buffers.',
      highlight: 'Enables regional chain visibility from a single unified cockpit.',
      linkPath: '/outlets',
      linkText: 'View Branch Leaderboard',
    },
    {
      title: 'Executive ESG Scorecard & 1-Page PDF Audits',
      badge: 'Scientific Environmental Metrics',
      icon: <Leaf className="w-6 h-6 text-teal-500" />,
      content:
        'FoodSense computes carbon footprint reductions (2.5 kg CO2e / kg food waste IPCC standard), agricultural water savings (850 L / kg), and landfill diversion. Export verified 1-page PDF audits formatted with ReportLab for executive stakeholders.',
      highlight: 'Earned 4 ESG milestone badges with an Overall Score of 91/100.',
      linkPath: '/sustainability',
      linkText: 'View Sustainability Scorecard',
    },
  ];

  const step = tourSteps[currentStep];

  const handleNavigate = () => {
    navigate(step.linkPath);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      isDirty={true}
      confirmDiscardTitle="Exit guided pitch tour?"
      confirmDiscardMessage="Are you sure you want to exit the demonstration tour?"
      confirmDiscardConfirmText="Exit Tour"
      confirmDiscardCancelText="Continue Tour"
      showCloseButton={true}
      ariaLabel="Product Pitch Guided Tour"
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 shrink-0">
            {step.icon}
          </div>
          <div className="min-w-0">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {step.badge}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {step.title}
            </h3>
          </div>
        </div>
      }
    >
      <div className="space-y-5 pt-1">
        {/* Content */}
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.content}
          </p>

          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{step.highlight}</span>
          </div>
        </div>

        {/* Progression Dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {tourSteps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentStep(i)}
              aria-label={`Jump to step ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                currentStep === i
                  ? 'w-6 bg-emerald-600'
                  : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNavigate}
              className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl transition-all"
            >
              {step.linkText} →
            </button>

            {currentStep < tourSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(tourSteps.length - 1, prev + 1))}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl shadow-md"
              >
                Finish Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
