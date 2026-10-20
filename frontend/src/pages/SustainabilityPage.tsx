import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  Leaf,
  Droplets,
  CloudSun,
  Utensils,
  Car,
  Trees,
  Award,
  Download,
  ShieldCheck,
  Sparkles,
  Heart,
  Compass,
  FileText,
  Info,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Badge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  earned_date?: string;
  progress_pct?: number;
  icon: string;
  tier: string;
}

interface SustainabilityData {
  sustainability_score: number;
  score_rating: string;
  waste_prevented_kg: number;
  co2_avoided_kg: number;
  co2_avoided_tons: number;
  water_saved_liters: number;
  landfill_diverted_kg: number;
  equivalent_meals: number;
  equivalencies: {
    car_km_avoided: number;
    trees_annual_absorption: number;
    household_water_days: number;
  };
  emission_factors: {
    co2_per_kg_waste: string;
    water_footprint_liters_per_kg: string;
    disclaimer: string;
  };
  monthly_trend: Array<{
    month: string;
    score: number;
    waste_pct: number;
    co2_avoided_kg: number;
  }>;
  badges: Badge[];
}

export const SustainabilityPage: React.FC = () => {
  const [data, setData] = useState<SustainabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchScorecard = async () => {
    try {
      setLoading(true);
      const res = await client.get<SustainabilityData>('/sustainability/scorecard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load sustainability scorecard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScorecard();
  }, []);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const response = await client.get('/sustainability/download-report', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'FoodSense_Sustainability_Impact_Audit.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
      default:
        return <Compass className="w-5 h-5 text-sky-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Calculating environmental impact metrics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5" />
              <span>ESG Impact & Sustainability Scorecard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Green Sustainability Scorecard
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-2xl">
              Track carbon footprint reductions, landfill diversion, and water preservation delivered by FoodSense
              demand forecasting and surplus redistribution.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-emerald-500/30 text-white font-black text-xl border border-emerald-400/30">
                {data.sustainability_score}
              </div>
              <div>
                <p className="text-[11px] text-emerald-200 uppercase font-semibold">Overall Index</p>
                <p className="text-sm font-bold text-white">{data.score_rating}</p>
              </div>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>{downloadingPdf ? 'Exporting PDF...' : 'Download Executive PDF Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Impact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: CO2 Avoided */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 min-w-0 pr-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                CO2e Avoided (Estimate)
              </span>
              <div className="relative group/tip flex-shrink-0">
                <span
                  className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 text-[10px] cursor-help font-bold"
                  title="Formula: Avoided Food Waste (kg) × 2.5 kg CO2e / kg (IPCC / CEA Sri Lanka factor)"
                >
                  i
                </span>
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tip:block z-30 w-60 p-2 text-[11px] leading-tight text-white bg-slate-900 rounded-lg shadow-xl border border-slate-700 pointer-events-none">
                  <span className="font-bold text-emerald-400 block mb-0.5">Formula:</span>
                  Avoided Food Waste (kg) × 2.5 kg CO2e / kg (IPCC / CEA Sri Lanka emission standard).
                </div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CloudSun className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.co2_avoided_kg.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg CO2e</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            ≈ {data.co2_avoided_tons} metric tons GHG prevented
          </p>
        </div>

        {/* Metric 2: Water Saved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 min-w-0 pr-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Water Saved (Estimate)
              </span>
              <div className="relative group/tip flex-shrink-0">
                <span
                  className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 text-[10px] cursor-help font-bold"
                  title="Formula: Avoided Food Waste (kg) × 850 Liters / kg (Water Footprint Network benchmark)"
                >
                  i
                </span>
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tip:block z-30 w-60 p-2 text-[11px] leading-tight text-white bg-slate-900 rounded-lg shadow-xl border border-slate-700 pointer-events-none">
                  <span className="font-bold text-sky-400 block mb-0.5">Formula:</span>
                  Avoided Food Waste (kg) × 850 Liters / kg (Water Footprint Network benchmark).
                </div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.water_saved_liters.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">Liters</span>
          </div>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 mt-1 font-medium">
            Agricultural & supply chain water conserved
          </p>
        </div>

        {/* Metric 3: Landfill Diverted */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 min-w-0 pr-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Landfill Diverted (Estimate)
              </span>
              <div className="relative group/tip flex-shrink-0">
                <span
                  className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 text-[10px] cursor-help font-bold"
                  title="Formula: 1 kg diverted per 1 kg food waste averted from landfill"
                >
                  i
                </span>
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tip:block z-30 w-60 p-2 text-[11px] leading-tight text-white bg-slate-900 rounded-lg shadow-xl border border-slate-700 pointer-events-none">
                  <span className="font-bold text-teal-400 block mb-0.5">Formula:</span>
                  1 kg solid waste diverted per 1 kg avoided perishable food loss.
                </div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.landfill_diverted_kg.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg Mass</span>
          </div>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
            Kept out of municipal landfill sites
          </p>
        </div>

        {/* Metric 4: Meals Rescued */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 min-w-0 pr-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Meals Rescued (Estimate)
              </span>
              <div className="relative group/tip flex-shrink-0">
                <span
                  className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 text-[10px] cursor-help font-bold"
                  title="Formula: Avoided Food Waste (kg) / 0.4 kg per meal portion (FAO standard)"
                >
                  i
                </span>
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tip:block z-30 w-60 p-2 text-[11px] leading-tight text-white bg-slate-900 rounded-lg shadow-xl border border-slate-700 pointer-events-none">
                  <span className="font-bold text-amber-400 block mb-0.5">Formula:</span>
                  Avoided Food Waste (kg) / 0.4 kg per nutritional meal portion (FAO standard).
                </div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.equivalent_meals.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">Portions</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
            Redirected to community charities & staff meals
          </p>
        </div>
      </div>

      {/* Real-World Equivalencies Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 dark:from-slate-800/80 dark:via-slate-800 dark:to-slate-900 border border-emerald-200/60 dark:border-slate-700">
        <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-4">
          Real-World Ecological Equivalencies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {data.equivalencies.car_km_avoided.toLocaleString()} km
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Driven in passenger cars avoided
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {data.equivalencies.trees_annual_absorption.toLocaleString()} Trees
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Annual carbon sequestration equivalent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {data.equivalencies.household_water_days.toLocaleString()} Days
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clean tap water for an average household
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Monthly Progression Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              6-Month Sustainability Index & Carbon Trend
            </h3>
            <p className="text-xs text-slate-500">
              Historical performance demonstrating continuous waste mitigation and carbon reduction.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              +33 pts improvement since May
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthly_trend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[40, 100]} tick={{ fontSize: 11 }} unit=" pts" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit=" kg" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="score"
                name="Sustainability Index (0-100)"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreGrad)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="co2_avoided_kg"
                name="CO2 Avoided (kg)"
                stroke="#0284c7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#co2Grad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sustainability Badges Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sustainability Milestone Badges
            </h3>
            <p className="text-xs text-slate-500">
              Recognized operational achievements under the FoodSense ESG Protocol.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            4 of 5 Achieved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all ${
                badge.earned
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
                  : 'bg-slate-50 dark:bg-slate-850/40 border-dashed border-slate-300 dark:border-slate-700 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    badge.earned
                      ? 'bg-emerald-50 dark:bg-emerald-950/60'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {renderBadgeIcon(badge.icon)}
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    badge.tier === 'Platinum'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : badge.tier === 'Gold'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : badge.tier === 'Silver'
                      ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  }`}
                >
                  {badge.tier}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {badge.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {badge.description}
              </p>

              {badge.earned ? (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Unlocked on {badge.earned_date}</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Progress</span>
                    <span>{badge.progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${badge.progress_pct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Methodology and LCA Standards Note */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Scientific Emission Factors & Calculation Methodology</span>
        </div>
        <p>• {data.emission_factors.co2_per_kg_waste}</p>
        <p>• {data.emission_factors.water_footprint_liters_per_kg}</p>
        <p className="italic text-[11px] text-slate-500">{data.emission_factors.disclaimer}</p>
      </div>
    </div>
  );
};
