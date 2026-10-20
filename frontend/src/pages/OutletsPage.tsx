import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  Store,
  Trophy,
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  X,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface BranchLeaderboardItem {
  outlet_id: string;
  name: string;
  city: string;
  revenue_lkr: number;
  waste_cost_lkr: number;
  waste_percentage: number;
  forecast_accuracy: number;
  monthly_savings_lkr: number;
  compliance_rate: number;
  co2_avoided_kg: number;
  tier: string;
  rank: number;
}

interface OutletsData {
  enterprise_summary: {
    total_outlets: number;
    total_enterprise_revenue_lkr: number;
    total_enterprise_waste_lkr: number;
    total_enterprise_savings_lkr: number;
    average_forecast_accuracy: number;
    top_performing_outlet: string;
  };
  leaderboard: BranchLeaderboardItem[];
}

export const OutletsPage: React.FC = () => {
  const [data, setData] = useState<OutletsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [outletId, setOutletId] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Colombo');
  const [address, setAddress] = useState('');

  const fetchOutlets = async () => {
    try {
      setLoading(true);
      const res = await client.get<OutletsData>('/outlets/leaderboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load outlets leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await client.post('/outlets', {
        outlet_id: outletId,
        name,
        city,
        address,
      });
      setIsModalOpen(false);
      setOutletId('');
      setName('');
      setAddress('');
      fetchOutlets();
    } catch (err) {
      console.error('Failed to create outlet:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading multi-outlet performance matrix...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>Multi-Outlet Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Branch Benchmarks & Waste Leaderboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare food waste rates, forecast precision, and counterfactual savings across Colombo, Kandy, and Galle branches.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Branch</span>
        </button>
      </div>

      {/* Enterprise Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Network Outlets
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {data.enterprise_summary.total_outlets} Branches
          </span>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Top Performer: {data.enterprise_summary.top_performing_outlet}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Cumulative Enterprise Revenue
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            Rs. {(data.enterprise_summary.total_enterprise_revenue_lkr / 1000000).toFixed(2)}M
          </span>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Aggregated 3-branch volume
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Operational Waste
          </span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
            Rs. {data.enterprise_summary.total_enterprise_waste_lkr.toLocaleString()}
          </span>
          <p className="text-[11px] text-rose-500 mt-1 font-medium">
            Mitigated by AI ordering buffers
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Network Forecast Accuracy
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {data.enterprise_summary.average_forecast_accuracy}%
          </span>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Rs. {data.enterprise_summary.total_enterprise_savings_lkr.toLocaleString()} monthly savings
          </p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Branch Performance Comparison (Accuracy vs Waste Rate)
            </h3>
            <p className="text-xs text-slate-500">
              High forecast accuracy directly correlates with reduced food spoilage across all branches.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Industry Benchmark Standards
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.leaderboard} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
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
              <Bar dataKey="forecast_accuracy" name="Forecast Accuracy %" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="waste_percentage" name="Waste % Rate" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranked Leaderboard Cards & Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Branch Ranking & Operational Efficiency Leaderboard</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.leaderboard.map((branch) => (
            <div
              key={branch.outlet_id}
              className={`p-5 rounded-2xl border transition-all ${
                branch.rank === 1
                  ? 'bg-gradient-to-br from-amber-50/50 via-white to-emerald-50/30 dark:from-slate-800 dark:to-slate-800/90 border-amber-300 dark:border-amber-500/30 shadow-md ring-1 ring-amber-400/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                      branch.rank === 1
                        ? 'bg-amber-500 text-white shadow-sm'
                        : branch.rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : 'bg-amber-700/80 text-white'
                    }`}
                  >
                    #{branch.rank}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {branch.city}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    branch.rank === 1
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : branch.rank === 2
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {branch.tier}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 truncate">
                {branch.name}
              </h4>

              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-700/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Waste Rate</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {branch.waste_percentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Forecast Accuracy</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {branch.forecast_accuracy}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Savings</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    Rs. {branch.monthly_savings_lkr.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GHG Avoided</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                    {branch.co2_avoided_kg} kg CO2e
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal to Register New Branch */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Branch"
        icon={
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 block">
            <Store className="w-5 h-5" />
          </span>
        }
        size="md"
        isDirty={Boolean(outletId.trim() || name.trim() || address.trim() || city !== 'Colombo')}
        isSubmitting={submitting}
        ariaLabel="Register New Branch"
      >
        <form onSubmit={handleCreateOutlet} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Branch ID Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. OUT-NEG"
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Branch Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Negombo Lagoon Gourmet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              City / District
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Negombo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g. 102 Poruthota Road, Negombo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Save Branch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
