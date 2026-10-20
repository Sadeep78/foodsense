import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Download,
  Filter,
  Sparkles,
  Sliders,
  TrendingDown,
  Leaf,
  Coins,
  RefreshCw,
  FileText,
  Printer,
  ChevronDown,
  Mail,
  X,
  CheckCircle2,
  Send,
} from 'lucide-react';
import client from '../api/client';
import { WasteReportResponse, WasteReportItem, WhatIfResponse } from '../types';
import { Modal } from '../components/common/Modal';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<WasteReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof WasteReportItem>('waste_cost');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Email Summary State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('manager@foodsense.lk');
  const [includePdf, setIncludePdf] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResponse, setEmailResponse] = useState<any>(null);

  // What-if simulator state
  const [compliancePct, setCompliancePct] = useState<number>(80);
  const [markdownPct, setMarkdownPct] = useState<number>(30);
  const [simResult, setSimResult] = useState<WhatIfResponse | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  const fetchWasteReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      const res = await client.get('/reports/waste', { params });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load waste report:', err);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (comp: number, mark: number) => {
    setSimLoading(true);
    try {
      const res = await client.post('/reports/what-if', {
        ordering_compliance_pct: comp,
        markdown_discount_pct: mark,
      });
      setSimResult(res.data);
    } catch (err) {
      console.error('Failed to run what-if simulation:', err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteReport();
  }, [selectedCategory]);

  useEffect(() => {
    runSimulation(compliancePct, markdownPct);
  }, [compliancePct, markdownPct]);

  const handleExportCSV = () => {
    const url = selectedCategory !== 'All'
      ? `http://localhost:8000/reports/export/csv?category=${selectedCategory}`
      : 'http://localhost:8000/reports/export/csv';
    window.open(url, '_blank');
  };

  const handleExportPDF = () => {
    const url = selectedCategory !== 'All'
      ? `http://localhost:8000/reports/export/pdf?category=${selectedCategory}`
      : 'http://localhost:8000/reports/export/pdf';
    window.open(url, '_blank');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSendingEmail(true);
      const res = await client.post('/reports/email-weekly-summary', {
        recipient_email: recipientEmail,
        include_pdf_attachment: includePdf,
      });
      setEmailResponse(res.data);
    } catch (err) {
      console.error('Failed to send email summary:', err);
    } finally {
      setSendingEmail(false);
    }
  };

  const sortedItems = [...(data?.items || [])].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return sortAsc
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const currency = data?.currency || 'LKR';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Exports */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Food Spoilage & Waste Analytics Audit</span>
            <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
              Audit Ready
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Granular breakdown of historical losses, root-cause classifications, and counterfactual savings modeling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIsEmailModalOpen(true);
              setEmailResponse(null);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 transition-all shadow-sm"
          >
            <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Email Weekly Digest</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md shadow-emerald-700/20 transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>Download Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Inventory Procured
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
            {currency} {data?.total_received_cost.toLocaleString() || '0'}
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
            Cumulative Food Waste Cost
          </span>
          <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
            {currency} {data?.total_waste_cost.toLocaleString() || '0'}
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Overall Spoilage Percentage
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
            {data?.overall_waste_pct || '0'}%
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block mb-1">
            Carbon Footprint of Waste
          </span>
          <span className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
            {data?.co2_emissions_kg.toLocaleString() || '0'} kg CO2e
          </span>
        </div>
      </div>

      {/* "What-If" Counterfactual Savings Simulator */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 via-brand-950 to-slate-950 text-white shadow-xl border border-brand-800/40 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <h3 className="text-base font-bold tracking-tight">
                "What-If" Counterfactual Waste Reduction Simulator
              </h3>
            </div>
            <p className="text-xs text-emerald-200/80">
              Simulate prospective financial and ecological dividends from following FoodSense recommendations.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Dynamic ROI: {simResult?.roi_multiple || 3.8}x
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Slider 1: Recommendation Compliance */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Ordering Recommendation Compliance</span>
              <span className="text-emerald-300 font-bold text-sm">{compliancePct}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={compliancePct}
              onChange={(e) => setCompliancePct(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <p className="text-[11px] text-emerald-200/60">
              Percentage of weekly replenishment orders strictly adhering to Holt-Winters model quantities.
            </p>
          </div>

          {/* Slider 2: Dynamic Markdown Rescue */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Perishable Markdown Discount Rate</span>
              <span className="text-emerald-300 font-bold text-sm">{markdownPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={markdownPct}
              onChange={(e) => setMarkdownPct(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <p className="text-[11px] text-emerald-200/60">
              Promotional evening discount deployed on items with ≤ 2 days of remaining shelf life.
            </p>
          </div>
        </div>

        {/* Simulated Dividend Output Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                Net Cost Recovered (Estimate)
              </span>
              <span
                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] cursor-help font-bold"
                title="Formula: (Baseline Waste Cost - Simulated Waste Cost) + Dynamic Markdown Salvage Revenue"
              >
                i
              </span>
            </div>
            <span className="text-2xl font-black text-white">
              {currency} {simResult?.estimated_savings_lkr.toLocaleString() || '0'}
            </span>
            <span className="text-[10px] text-emerald-200 block mt-1">
              -{simResult?.waste_reduction_pct}% Spoilage Reduction
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                Prevented Emissions (Estimate)
              </span>
              <span
                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] cursor-help font-bold"
                title="Formula: Averted Food Waste (kg) × 2.5 kg CO2e / kg (IPCC Waste Model)"
              >
                i
              </span>
            </div>
            <span className="text-2xl font-black text-teal-300">
              {simResult?.co2_avoided_kg.toLocaleString() || '0'} kg CO2e
            </span>
            <span className="text-[10px] text-emerald-200 block mt-1">
              Equivalent to planting ~{(Number(simResult?.co2_avoided_kg || 0) / 22).toFixed(0)} mature trees
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block mb-1">
              Projected Post-Optimization Loss
            </span>
            <span className="text-2xl font-black text-emerald-200">
              {currency} {simResult?.projected_waste_cost.toLocaleString() || '0'}
            </span>
            <span className="text-[10px] text-emerald-300 block mt-1">
              Baseline: {currency} {simResult?.baseline_waste_cost.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-xs text-emerald-100 leading-relaxed font-mono">
          💡 {simResult?.narrative}
        </div>
      </div>

      {/* Filter and Detailed Table */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <option value="All">All Categories</option>
              <option value="Bakery">Bakery</option>
              <option value="Dairy">Dairy</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Meat & Fish">Meat & Fish</option>
              <option value="Cooked Meals">Cooked Meals</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Showing {sortedItems.length} products • Click headers to sort
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => {
                    setSortField('product_name');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-3 cursor-pointer hover:text-brand-600"
                >
                  Product Name
                </th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Procured</th>
                <th className="px-4 py-3 text-right">Sold</th>
                <th className="px-4 py-3 text-right">Wasted</th>
                <th
                  onClick={() => {
                    setSortField('waste_percentage');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-3 text-right cursor-pointer hover:text-brand-600"
                >
                  Waste %
                </th>
                <th
                  onClick={() => {
                    setSortField('waste_cost');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-3 text-right cursor-pointer hover:text-brand-600 font-bold"
                >
                  Loss Cost ({currency})
                </th>
                <th className="px-4 py-3">Primary Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedItems.map((it) => (
                <tr key={it.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {it.product_name}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {it.category}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-mono">
                    {it.total_received.toLocaleString()} {it.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-mono">
                    {it.total_sold.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600 font-mono font-bold">
                    {it.total_wasted.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-200">
                    {it.waste_percentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-rose-600 dark:text-rose-400">
                    {it.waste_cost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {it.primary_reason}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Weekly Digest Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setEmailResponse(null);
        }}
        title="Schedule Weekly Executive Email Digest"
        subtitle="Dispatches automated waste metrics, culprit SKUs & PDF audit to managers."
        icon={
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Mail className="w-5 h-5" />
          </div>
        }
        size="lg"
        isDirty={!emailResponse && Boolean(recipientEmail.trim() && recipientEmail !== 'manager@foodsense.lk')}
        isSubmitting={sendingEmail}
        ariaLabel="Schedule Weekly Executive Email Digest"
      >
        {emailResponse ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{emailResponse.message}</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Subject: {emailResponse.subject} • Dispatched at: {emailResponse.sent_at}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rendered HTML Email Preview:
              </p>
              <div
                className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs max-h-56 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: emailResponse.html_preview }}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setEmailResponse(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendEmail} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient Manager Email
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. manager@foodsense.lk"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePdf}
                onChange={(e) => setIncludePdf(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Attach executive <code>FoodSense_Audit_Report.pdf</code> (ReportLab)
              </span>
            </label>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                Demo Mode Notice:
              </p>
              Simulates standard SMTP mail delivery with interactive HTML digest preview.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingEmail}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50 transition-all"
              >
                {sendingEmail ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{sendingEmail ? 'Dispatching...' : 'Dispatch Email Summary'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

