import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Calendar,
  CloudRain,
  Sun,
  Sparkles,
  TrendingUp,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import client from '../api/client';
import { EventsImpactAnalysisResponse, EventCalendarItem } from '../types';
import { Modal } from '../components/common/Modal';

export const EventsPage: React.FC = () => {
  const [data, setData] = useState<EventsImpactAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('local_promo');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [demandLiftPct, setDemandLiftPct] = useState<number>(25.0);
  const [affectedCategories, setAffectedCategories] = useState('Cooked Meals, Bakery');

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      const res = await client.get<EventsImpactAnalysisResponse>('/events/impact-analysis');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load events data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setStartDate('');
    setEndDate('');
    setDemandLiftPct(25.0);
    setAffectedCategories('Cooked Meals, Bakery');
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await client.post('/events', {
        title,
        event_type: eventType,
        start_date: startDate,
        end_date: endDate || startDate,
        demand_lift_pct: Number(demandLiftPct),
        affected_categories: affectedCategories,
      });
      handleCloseModal();
      await fetchEventsData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add custom event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Weather & Event Impact on Demand
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sri Lankan public holidays, full moon Poya days, seasonal monsoon weather regressors, and demand uplift modeling.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Schedule Custom Event
        </button>
      </div>

      {/* Accuracy Improvement Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              +{data?.accuracy_improvement_pct || 7.8}% Statistical Accuracy Improvement
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5 max-w-xl">
              Integrating Sri Lankan cultural calendar regressors and tropical weather patterns boosts forecast accuracy from 84.4% to 92.2%, preventing under-ordering during Avurudu/Poya peaks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/15 p-3 rounded-xl border border-white/10">
          <div>
            <span className="text-[10px] uppercase text-emerald-200 block font-semibold">Standard HW</span>
            <span className="text-sm font-bold text-white">84.4% Accuracy</span>
          </div>
          <span className="text-emerald-300 font-bold">→</span>
          <div>
            <span className="text-[10px] uppercase text-emerald-200 block font-semibold">Event-Adjusted HW</span>
            <span className="text-sm font-extrabold text-emerald-200">92.2% Accuracy</span>
          </div>
        </div>
      </div>

      {/* Demand Uplift by Event Chart & 7-Day Weather Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Uplift Chart */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            Demand Uplift Multipliers by Event Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Estimated percentage increase in footfall and preparation requirements.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.uplift_by_event || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="event" tick={{ fontSize: 10 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`+${val}% demand lift`, 'Uplift']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="lift_pct" radius={[6, 6, 0, 0]}>
                  {(data?.uplift_by_event || []).map((_, idx) => (
                    <Cell key={idx} fill={idx % 2 === 0 ? '#16a34a' : '#0ea5e9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Weather Outlook & Delivery Impacts */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-500" />
              Weather Regressors (Colombo Region)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Surges in hot meals and deliveries during afternoon monsoons.
            </p>

            <div className="space-y-2">
              {(data?.weather_forecast || []).map((w, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {w.condition.includes('Rain') || w.condition.includes('Monsoon') ? (
                      <CloudRain className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                        {w.date}
                      </span>
                      <span className="text-[10px] text-slate-400">{w.condition} • {w.temp_c}°C</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      w.multiplier > 1.0
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {w.multiplier}x Impact
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events Calendar Table */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Sri Lankan Public Holidays, Poya Days & Scheduled Promotions ({data?.total_events_tracked || 0})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="p-3">Event / Observance</th>
                <th className="p-3">Type</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3 text-right">Demand Lift %</th>
                <th className="p-3">Impacted Product Lines</th>
                <th className="p-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.upcoming_events || []).map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{ev.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {ev.event_type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{ev.start_date}</td>
                  <td className="p-3 text-slate-500">{ev.end_date}</td>
                  <td className="p-3 text-right font-extrabold text-emerald-600">+{ev.demand_lift_pct}%</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{ev.affected_categories}</td>
                  <td className="p-3">
                    {ev.is_custom ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        Custom Promo
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">National Calendar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Schedule Custom Local Promotion"
        icon={
          <span className="p-2 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 block">
            <Calendar className="w-5 h-5" />
          </span>
        }
        size="md"
        isDirty={Boolean(title.trim() || startDate || endDate || demandLiftPct !== 25.0 || affectedCategories !== 'Cooked Meals, Bakery')}
        isSubmitting={submitting}
        ariaLabel="Schedule Custom Local Promotion"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">
              Event / Promotion Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Colombo Street Food Fiesta Promo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">
              Expected Demand Lift (%)
            </label>
            <input
              type="number"
              min="5"
              max="150"
              required
              value={demandLiftPct}
              onChange={(e) => setDemandLiftPct(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">
              Affected Product Categories
            </label>
            <input
              type="text"
              value={affectedCategories}
              onChange={(e) => setAffectedCategories(e.target.value)}
              placeholder="e.g. Cooked Meals, Bakery"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Register Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
