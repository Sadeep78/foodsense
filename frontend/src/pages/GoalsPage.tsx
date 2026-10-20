import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  PlusCircle,
  X,
  Flame,
  Award,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { WasteGoal } from '../types';
import { Modal } from '../components/common/Modal';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<WasteGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState('reduce_waste_pct');
  const [targetValue, setTargetValue] = useState<number>(5.0);
  const [baselineValue, setBaselineValue] = useState<number>(10.0);
  const [unit, setUnit] = useState('%');
  const [targetDate, setTargetDate] = useState('2026-12-31');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await client.get<WasteGoal[]>('/goals');
      setGoals(res.data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const todayStr = new Date().toISOString().split('T')[0];
      await client.post('/goals', {
        title,
        description,
        goal_type: goalType,
        target_value: Number(targetValue),
        baseline_value: Number(baselineValue),
        unit,
        start_date: todayStr,
        target_date: targetDate,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      await fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create goal');
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
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Waste Targets & Goal Tracker
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Define sustainability targets, track daily reduction velocity, and project milestone completion dates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Set New Target
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Evaluating real-time goal velocity and progress...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const isAchieved = goal.status === 'achieved' || goal.progress_pct >= 100;
            const isOnTrack = goal.status === 'on_track';

            return (
              <div
                key={goal.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-md tracking-wider ${
                          isAchieved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isOnTrack
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isAchieved ? 'Achieved' : isOnTrack ? 'On Track' : 'At Risk'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Due {goal.target_date}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {goal.progress_pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                    {goal.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {goal.description || 'Continuous reduction target.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAchieved
                            ? 'bg-emerald-500'
                            : isOnTrack
                            ? 'bg-brand-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, goal.progress_pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Target vs Current Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Baseline
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {goal.baseline_value.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Current
                      </span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {goal.current_value.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Target
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {goal.target_value.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Projection */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {goal.projected_completion_date
                        ? `Projected completion: ${goal.projected_completion_date}`
                        : 'Tracking daily velocity'}
                    </span>
                  </div>

                  {isAchieved ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Milestone Reached
                    </span>
                  ) : (
                    <span className="text-brand-600 font-semibold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Active Velocity
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Target Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Define New Performance Target"
        icon={
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 block">
            <Target className="w-5 h-5" />
          </span>
        }
        size="lg"
        isDirty={Boolean(title.trim() || description.trim() || targetValue !== 5.0 || baselineValue !== 10.0 || targetDate !== '2026-12-31')}
        isSubmitting={submitting}
        ariaLabel="Define New Performance Target"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Target Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Reduce Cooked Meals Spoilage Under 4%"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Strategic Metric Type
            </label>
            <select
              value={goalType}
              onChange={(e) => {
                setGoalType(e.target.value);
                if (e.target.value === 'reduce_waste_pct') setUnit('%');
                else if (e.target.value === 'save_cost_lkr') setUnit('Rs.');
                else if (e.target.value === 'meals_donated') setUnit('meals');
                else if (e.target.value === 'co2_avoided') setUnit('kg CO2e');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
            >
              <option value="reduce_waste_pct">Food Waste % Reduction</option>
              <option value="save_cost_lkr">Cost Savings Recovery (LKR)</option>
              <option value="meals_donated">Community Meals Donated</option>
              <option value="co2_avoided">CO2e Emissions Avoided (kg)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Baseline Starting Value
              </label>
              <input
                type="number"
                step="any"
                required
                value={baselineValue}
                onChange={(e) => setBaselineValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Target Goal Value
              </label>
              <input
                type="number"
                step="any"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Target Deadline Date
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Context / Action Plan
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Daily forecast order reviews and dynamic markdowns after 7 PM."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Setting...' : 'Activate Target'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
