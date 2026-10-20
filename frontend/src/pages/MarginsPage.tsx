import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  PieChart,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';
import client from '../api/client';
import { MarginAnalysisResponse, SKUMarginItem } from '../types';

export const MarginsPage: React.FC = () => {
  const [data, setData] = useState<MarginAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMargins = async () => {
    try {
      setLoading(true);
      const res = await client.get<MarginAnalysisResponse>('/margins');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load margin analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMargins();
  }, []);

  const filteredSkus = (data?.sku_analysis || []).filter((item) => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedQuadrant === 'all') return matchesSearch;
    return matchesSearch && item.quadrant === selectedQuadrant;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <DollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Profit & Margin Analysis (Erosion by Waste)
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Compare SKU commercial gross margins against revenue eroded by spoilage to optimize menu pricing and batch sizing.
          </p>
        </div>

        <button
          onClick={fetchMargins}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Economics
        </button>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Annual Gross Revenue
          </span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Rs. {(data?.summary.total_revenue || 0).toLocaleString()}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              COGS: Rs. {(data?.summary.total_cogs || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Gross Margin (Pre-Waste)
          </span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              {(data?.summary.gross_margin_pct || 0).toFixed(1)}%
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Gross profit Rs. {(data?.summary.gross_profit || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Spoilage Margin Erosion
          </span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              -{(data?.summary.waste_margin_erosion_pct || 0).toFixed(1)}%
            </span>
            <p className="mt-1 text-xs text-rose-500">
              Rs. {(data?.summary.total_waste_cost || 0).toLocaleString()} lost to landfill
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Net Margin After Waste
          </span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {(data?.summary.net_margin_pct || 0).toFixed(1)}%
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Realized profit Rs. {(data?.summary.net_profit_after_waste || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Strategic Quadrant Scatter Chart */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-brand-600" />
              SKU Profitability vs Spoilage Risk Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifies high-margin staples to protect vs high-waste items requiring markdown pricing or portion re-engineering.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Stars ({data?.quadrant_counts.stars})
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Cash Cows ({data?.quadrant_counts.cash_cows})
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              High Risk ({data?.quadrant_counts.high_risk})
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Critical ({data?.quadrant_counts.drainers})
            </span>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis
                type="number"
                dataKey="net_margin_pct"
                name="Net Margin %"
                unit="%"
                domain={[-10, 50]}
                tick={{ fontSize: 11 }}
                label={{ value: 'Net Profit Margin % (After Waste)', position: 'insideBottom', offset: -10, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="waste_rate_pct"
                name="Waste Rate %"
                unit="%"
                domain={[0, 25]}
                tick={{ fontSize: 11 }}
                label={{ value: 'Waste Rate %', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
              />
              <ZAxis range={[120, 220]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item: SKUMarginItem = payload[0].payload;
                    return (
                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">{item.product_name}</p>
                        <p className="text-[11px] text-slate-500">{item.category}</p>
                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                          <p><span className="text-slate-400">Net Margin:</span> <span className="font-bold text-emerald-600">{item.net_margin_pct}%</span></p>
                          <p><span className="text-slate-400">Waste Rate:</span> <span className="font-bold text-rose-600">{item.waste_rate_pct}%</span> (Rs. {item.waste_cost.toLocaleString()})</p>
                          <p><span className="text-slate-400">Strategy:</span> <span className="font-medium text-brand-600">{item.recommended_action}</span></p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={25} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "25% Target Margin", fontSize: 10, fill: "#94a3b8" }} />
              <ReferenceLine y={7.5} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "7.5% Waste Threshold", fontSize: 10, fill: "#94a3b8" }} />
              <Scatter name="Products" data={data?.sku_analysis || []}>
                {(data?.sku_analysis || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Level Margin Breakdown Table */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Category Profitability & Spoilage Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Revenue (LKR)</th>
                <th className="p-3 text-right">Gross Profit</th>
                <th className="p-3 text-right">Gross Margin %</th>
                <th className="p-3 text-right text-rose-600">Waste Cost</th>
                <th className="p-3 text-right">Net Profit</th>
                <th className="p-3 text-right text-emerald-600">Net Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.category_summary || []).map((cat) => (
                <tr key={cat.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{cat.category}</td>
                  <td className="p-3 text-right">Rs. {cat.revenue.toLocaleString()}</td>
                  <td className="p-3 text-right">Rs. {cat.gross_profit.toLocaleString()}</td>
                  <td className="p-3 text-right font-medium">{cat.gross_margin_pct}%</td>
                  <td className="p-3 text-right font-bold text-rose-600">Rs. {cat.waste_cost.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">Rs. {cat.net_profit.toLocaleString()}</td>
                  <td className="p-3 text-right font-black text-emerald-600">{cat.net_margin_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SKU Action Matrix */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              SKU Strategic Matrix & Operational Directives
            </h3>
            <p className="text-xs text-slate-500">
              Itemized profit recovery advice ranked by highest spoilage impact.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search SKU or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <select
              value={selectedQuadrant}
              onChange={(e) => setSelectedQuadrant(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Quadrants</option>
              <option value="Star">Stars (High Margin, Low Waste)</option>
              <option value="Cash Cow">Cash Cows (Stable Staple)</option>
              <option value="High Spoilage Risk">High Spoilage Risk</option>
              <option value="Critical Attention">Critical Attention</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="p-3">SKU Name</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Sold Qty</th>
                <th className="p-3 text-right">Revenue</th>
                <th className="p-3 text-right text-rose-600">Waste Cost</th>
                <th className="p-3 text-right">Net Margin %</th>
                <th className="p-3">Quadrant Classification</th>
                <th className="p-3">Recommended Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSkus.map((item) => (
                <tr key={item.product_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {item.product_name}
                  </td>
                  <td className="p-3 text-slate-500">{item.category}</td>
                  <td className="p-3 text-right">{item.quantity_sold} {item.unit}</td>
                  <td className="p-3 text-right font-medium">Rs. {item.revenue.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold text-rose-600">Rs. {item.waste_cost.toLocaleString()}</td>
                  <td className="p-3 text-right font-black text-emerald-600">{item.net_margin_pct}%</td>
                  <td className="p-3">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      {item.quadrant}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                    {item.recommended_action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
