import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  TrendingDown,
  PiggyBank,
  CheckCircle2,
  ArrowRight,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Layers,
  Calendar,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Check,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { InsightSummaryResponse, InsightItem } from '../types';
import { Badge } from '../components/common/Badge';

export const InsightsPage: React.FC = () => {
  const { currency } = useAuth();
  const [data, setData] = useState<InsightSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'savings' | 'severity'>('savings');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await client.get<InsightSummaryResponse>('/insights');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleApply = async (insightId: number, title: string, savings: number) => {
    try {
      setActionLoading(insightId);
      const res = await client.post(`/insights/${insightId}/apply`);
      
      // Fire subtle celebratory confetti for cost-saving actions
      if (savings > 0) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#10b981', '#059669', '#34d399', '#6ee7b7'],
          });
        } catch {
          // Quiet fallback
        }
      }

      setToastMessage({
        text: res.data.message || `Recommendation applied: ${title}`,
        type: 'success',
      });
      setTimeout(() => setToastMessage(null), 4500);
      await fetchInsights();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to apply recommendation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (insightId: number, title: string) => {
    try {
      setActionLoading(insightId);
      await client.post(`/insights/${insightId}/dismiss`);
      setToastMessage({
        text: `Insight "${title}" dismissed from active view.`,
        type: 'info',
      });
      setTimeout(() => setToastMessage(null), 3500);
      await fetchInsights();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to dismiss insight');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter and sort
  const filteredInsights = useMemo(() => {
    let items = (data?.insights || []).filter((item) => {
      // Tab filter
      if (severityFilter === 'applied') {
        if (!item.is_applied) return false;
      } else if (severityFilter !== 'all') {
        if (item.is_applied || item.severity !== severityFilter) return false;
      } else {
        // 'all' includes active unapplied items
        if (item.is_applied) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesCategory;
      }

      return true;
    });

    // Sorting
    return items.sort((a, b) => {
      if (sortBy === 'savings') {
        return b.potential_savings_lkr - a.potential_savings_lkr;
      }
      // Critical first, then warning, then info
      const order: Record<string, number> = { critical: 3, warning: 2, info: 1 };
      return (order[b.severity] || 0) - (order[a.severity] || 0);
    });
  }, [data, severityFilter, searchQuery, sortBy]);

  // Counts for tabs
  const allActiveCount = useMemo(() => {
    return (data?.insights || []).filter((i) => !i.is_applied).length;
  }, [data]);

  const appliedCount = useMemo(() => {
    return (data?.insights || []).filter((i) => i.is_applied).length;
  }, [data]);

  return (
    <div className="space-y-6 pb-14">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Smart Operational Insights
                </h1>
                <Badge variant="brand" dot>
                  AI Heuristics
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Continuous algorithmic detection of sales velocity anomalies, spoilage spikes, and buffer margin recovery.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchInsights}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 transition-all shadow-card hover:shadow-card-hover disabled:opacity-60 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>{loading ? 'Analyzing Data...' : 'Refresh Analysis'}</span>
        </button>
      </div>

      {/* Floating Modern Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-glass backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-slate-50/95 border-slate-200 text-slate-800 dark:bg-slate-900/90 dark:border-slate-700 dark:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`p-1 rounded-lg ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-600 text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss toast"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* ROW 1: 4 IMPACT KPI SUMMARY CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Potential Savings */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-card dark:bg-slate-900 dark:border-slate-800/90 flex flex-col justify-between h-[150px] min-h-[150px]">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Potential Savings
              </span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 shrink-0">
                <PiggyBank className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {currency} {(data?.total_potential_savings || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-2.5 mt-auto border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="truncate">Annual profit recovery</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">Heuristic ROI</span>
          </div>
        </div>

        {/* Card 2: Critical Actions */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-card dark:bg-slate-900 dark:border-slate-800/90 flex flex-col justify-between h-[150px] min-h-[150px]">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Critical Actions
              </span>
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
                {data?.critical_count || 0}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {(data?.critical_count || 0) === 1 ? 'critical alert' : 'critical alerts'}
              </span>
            </div>
          </div>

          <div className="pt-2.5 mt-auto border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="truncate">High-risk spoilage</span>
            {(data?.critical_count || 0) > 0 ? (
              <Badge variant="danger" dot pulse size="sm">
                Action Required
              </Badge>
            ) : (
              <span className="font-medium text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">All Clear</span>
            )}
          </div>
        </div>

        {/* Card 3: Warnings */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-card dark:bg-slate-900 dark:border-slate-800/90 flex flex-col justify-between h-[150px] min-h-[150px]">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pattern Warnings
              </span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 shrink-0">
                <TrendingDown className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                {data?.warning_count || 0}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {(data?.warning_count || 0) === 1 ? 'pattern anomaly' : 'pattern anomalies'}
              </span>
            </div>
          </div>

          <div className="pt-2.5 mt-auto border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="truncate">Sub-optimal patterns</span>
            <span className="font-medium text-amber-600 dark:text-amber-400 shrink-0 ml-2">Needs Review</span>
          </div>
        </div>

        {/* Card 4: Optimization Tips */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-card dark:bg-slate-900 dark:border-slate-800/90 flex flex-col justify-between h-[150px] min-h-[150px]">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Buffer Optimizations
              </span>
              <span className="p-2 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 shrink-0">
                <Lightbulb className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
                {data?.info_count || 0}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {(data?.info_count || 0) === 1 ? 'recommendation' : 'recommendations'}
              </span>
            </div>
          </div>

          <div className="pt-2.5 mt-auto border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="truncate">Safety stock & uplifts</span>
            <span className="font-medium text-sky-600 dark:text-sky-400 shrink-0 ml-2">Available</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: FILTER TABS & SEARCH BAR */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-card">
        {/* Severity Tabs with Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Active', count: allActiveCount },
            { id: 'critical', label: 'Critical', count: data?.critical_count || 0, variant: 'danger' as const },
            { id: 'warning', label: 'Warnings', count: data?.warning_count || 0, variant: 'warning' as const },
            { id: 'info', label: 'Optimizations', count: data?.info_count || 0, variant: 'info' as const },
            { id: 'applied', label: 'Applied History', count: appliedCount, variant: 'brand' as const },
          ].map((tab) => {
            const isActive = severityFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSeverityFilter(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search recommendations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'savings' | 'severity')}
            aria-label="Sort insights"
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="savings">Sort: Highest Savings</option>
            <option value="severity">Sort: By Severity</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 3: INSIGHT CARDS LIST */}
      {/* ======================================================== */}
      {loading ? (
        <div className="space-y-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-card dark:bg-slate-900 dark:border-slate-800/80 animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
                <div className="w-28 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="w-full h-4 bg-slate-100 dark:bg-slate-800/60 rounded mb-4" />
              <div className="flex justify-end gap-2">
                <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-card">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mx-auto mb-3 border border-emerald-100 dark:border-emerald-900/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Insights in This View
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No recommendations match "${searchQuery}". Try clearing your search keyword.`
              : severityFilter === 'applied'
              ? 'No recommendations have been marked as applied yet. Apply recommendations from the active tab.'
              : 'All detected operational recommendations have been acted upon or dismissed.'}
          </p>
          {(searchQuery || severityFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSeverityFilter('all');
              }}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight, idx) => {
            const isCritical = insight.severity === 'critical';
            const isWarning = insight.severity === 'warning';
            const isApplied = insight.is_applied;

            return (
              <div
                key={insight.id}
                className={`group relative p-5 bg-white border rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 dark:bg-slate-900 ${
                  isApplied
                    ? 'border-emerald-200/90 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10'
                    : isCritical
                    ? 'border-rose-200/90 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-800'
                    : isWarning
                    ? 'border-amber-200/90 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-800'
                    : 'border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Left Colored Accent Bar */}
                <div
                  className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                    isApplied
                      ? 'bg-emerald-500'
                      : isCritical
                      ? 'bg-rose-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                  }`}
                />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left Column: Severity, Category, Title, Description */}
                  <div className="flex-1 min-w-0 pl-1">
                    {/* Header Chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                        #{idx + 1}
                      </span>

                      {isApplied ? (
                        <Badge variant="brand" dot>
                          Applied
                        </Badge>
                      ) : isCritical ? (
                        <Badge variant="danger" dot pulse>
                          Critical Risk
                        </Badge>
                      ) : isWarning ? (
                        <Badge variant="warning" dot>
                          Warning Pattern
                        </Badge>
                      ) : (
                        <Badge variant="info" dot>
                          Optimization Tip
                        </Badge>
                      )}

                      <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-lg dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        {insight.category}
                      </span>
                    </div>

                    {/* Insight Title */}
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {insight.title}
                    </h2>

                    {/* Description Prose */}
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                      {insight.description}
                    </p>
                  </div>

                  {/* Right Column: Potential Savings & Action Buttons */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/80 shrink-0">
                    {/* Savings Benefit Badge */}
                    {insight.potential_savings_lkr > 0 && (
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                          Est. Annual Benefit
                        </span>
                        <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          +{currency} {insight.potential_savings_lkr.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="flex items-center gap-2">
                      {!insight.is_applied ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleApply(insight.id, insight.title, insight.potential_savings_lkr)
                            }
                            disabled={actionLoading === insight.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                          >
                            {actionLoading === insight.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                            <span>Apply Recommendation</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDismiss(insight.id, insight.title)}
                            disabled={actionLoading === insight.id}
                            title="Dismiss insight"
                            aria-label="Dismiss insight"
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-xl dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Action Applied</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
