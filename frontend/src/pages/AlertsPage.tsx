import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Coins,
  Tag,
  Gift,
  Utensils,
  CheckCircle2,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Heart,
  Percent,
  X,
} from 'lucide-react';
import client from '../api/client';
import { ExpiryAlertSummary, ExpiryAlertItem, DiscountSuggestionResponse, DiscountSuggestionItem } from '../types';
import { Modal } from '../components/common/Modal';

export const AlertsPage: React.FC = () => {
  const [data, setData] = useState<ExpiryAlertSummary | null>(null);
  const [discountData, setDiscountData] = useState<DiscountSuggestionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'critical' | 'warning' | 'notice'>('all');
  const [activeTab, setActiveTab] = useState<'alerts' | 'discounts'>('alerts');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState<string | null>(null);

  // Donate Modal State
  const [donateBatch, setDonateBatch] = useState<ExpiryAlertItem | null>(null);
  const [recipientNgo, setRecipientNgo] = useState('Sahana Community Kitchen Colombo');
  const [donateQty, setDonateQty] = useState<number>(0);
  const [donating, setDonating] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [resAlerts, resDiscounts] = await Promise.all([
        client.get('/alerts/expiry'),
        client.get<DiscountSuggestionResponse>('/discounts/suggestions?alert_days=3'),
      ]);
      setData(resAlerts.data);
      setDiscountData(resDiscounts.data);
    } catch (err) {
      console.error('Failed to fetch expiry alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleApplyDiscount = async (sug: DiscountSuggestionItem) => {
    try {
      setApplyingDiscount(sug.batch_id);
      const res = await client.post('/discounts/apply', {
        batch_id: sug.batch_id,
        discount_pct: sug.suggested_discount_pct,
        discounted_price: sug.suggested_price,
        recovered_estimate: sug.projected_recovered_revenue,
      });
      setActionFeedback(res.data.message || `Applied ${sug.suggested_discount_pct}% discount.`);
      setTimeout(() => setActionFeedback(null), 4000);
      await fetchAlerts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to apply markdown');
    } finally {
      setApplyingDiscount(null);
    }
  };

  const handleDonateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateBatch) return;

    try {
      setDonating(true);
      await client.post('/donations', {
        batch_id: donateBatch.batch_id,
        product_id: donateBatch.product_id,
        product_name: donateBatch.product_name,
        quantity: Number(donateQty || donateBatch.current_quantity),
        unit: donateBatch.unit,
        estimated_value_lkr: donateBatch.value_at_risk,
        recipient_ngo: recipientNgo,
        receipt_note: `Redistributed near-expiry batch ${donateBatch.batch_id} before expiration.`,
      });
      setActionFeedback(`Batch ${donateBatch.batch_id} marked as donated to ${recipientNgo}.`);
      setDonateBatch(null);
      setTimeout(() => setActionFeedback(null), 4000);
      await fetchAlerts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to donate batch');
    } finally {
      setDonating(false);
    }
  };

  const currency = data?.currency || 'LKR';

  const filteredAlerts = (data?.alerts || []).filter((al) => {
    if (filterUrgency === 'all') return true;
    return al.urgency === filterUrgency;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Perishable Expiry Risk Alerts & Salvage
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 rounded-full dark:bg-rose-950 dark:text-rose-300">
              FIFO Prevention
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitors active inventory batches expiring within 1, 3 and 7 days. Deploy dynamic price markdowns or dispatch community donations to avoid 100% loss.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Batches</span>
        </button>
      </div>

      {/* Floating feedback alert */}
      {actionFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 4 Summary Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Value at Risk */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-900 to-slate-900 text-white shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
            Total Inventory Value at Risk
          </span>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white">
              {currency} {data?.total_value_at_risk.toLocaleString() || '0'}
            </span>
          </div>
          <span className="text-xs text-rose-200/80">
            Across {data?.alerts.length || 0} active perishable batches
          </span>
        </div>

        {/* Dynamic Markdown Salvage Potential */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Markdown Recovery Potential
          </span>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {currency} {discountData?.total_potential_recovery_lkr.toLocaleString() || '0'}
            </span>
          </div>
          <span className="text-xs text-emerald-200/80">
            From {discountData?.total_batches_at_risk || 0} price-elastic batches
          </span>
        </div>

        {/* Critical (<= 1 Day) */}
        <div
          onClick={() => { setActiveTab('alerts'); setFilterUrgency('critical'); }}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filterUrgency === 'critical' && activeTab === 'alerts'
              ? 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
              : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'
          } border-rose-200 dark:border-rose-900/60`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider dark:text-rose-400">
              Critical (≤ 1 Day)
            </span>
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
          </div>
          <span className="text-2xl font-black text-rose-900 dark:text-white">
            {data?.critical_count || 0} Batches
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Immediate 40-50% clearance or charity donation
          </p>
        </div>

        {/* Warning (2-3 Days) */}
        <div
          onClick={() => { setActiveTab('alerts'); setFilterUrgency('warning'); }}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filterUrgency === 'warning' && activeTab === 'alerts'
              ? 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
              : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'
          } border-amber-200 dark:border-amber-900/60`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider dark:text-amber-400">
              Warning (2–3 Days)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-900 dark:text-white">
            {data?.warning_count || 0} Batches
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Apply 25-30% dynamic markdown flash sale
          </p>
        </div>
      </div>

      {/* Main Mode Toggle: Batch Expiry List vs Dynamic Markdown Optimizer */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'alerts'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Expiry Alerts ({data?.alerts.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'discounts'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            Dynamic Markdown Suggestions ({discountData?.suggestions.length || 0})
          </button>
        </div>

        {activeTab === 'alerts' && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl dark:bg-slate-800 text-xs">
            <button
              onClick={() => setFilterUrgency('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold ${
                filterUrgency === 'all' ? 'bg-white shadow-sm dark:bg-slate-900 text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUrgency('critical')}
              className={`px-2.5 py-1 rounded-lg font-semibold ${
                filterUrgency === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-500'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterUrgency('warning')}
              className={`px-2.5 py-1 rounded-lg font-semibold ${
                filterUrgency === 'warning' ? 'bg-amber-500 text-white' : 'text-slate-500'
              }`}
            >
              Warning
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: Dynamic Markdown Optimizer */}
      {activeTab === 'discounts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Price-Elasticity Optimization Active:</strong> Suggests optimal price points to sell maximum units before spoilage occurs, salvaging revenue vs a 100% loss.
              </span>
            </div>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
              Total Recovery: Rs. {discountData?.total_potential_recovery_lkr.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(discountData?.suggestions || []).map((sug) => (
              <div
                key={sug.batch_id}
                className="p-5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        {sug.batch_id} • {sug.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {sug.product_name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {sug.suggested_discount_pct}% OFF
                    </span>
                  </div>

                  {/* Price Comparison Box */}
                  <div className="grid grid-cols-2 gap-2 p-3 my-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Original Price</span>
                      <span className="text-slate-500 line-through">
                        Rs. {sug.original_price}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Suggested Price</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        Rs. {sug.suggested_price}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {sug.recommendation_text}
                  </p>

                  <div className="mt-3 py-2 px-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-[11px] flex items-center justify-between">
                    <span className="text-slate-500">Projected Salvage:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      +Rs. {sug.projected_recovered_revenue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleApplyDiscount(sug)}
                    disabled={applyingDiscount === sug.batch_id}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {applyingDiscount === sug.batch_id ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Tag className="w-3.5 h-3.5" />
                    )}
                    Mark as Discounted
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: Standard Expiry Alerts Grid */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlerts.map((al) => {
            const isCritical = al.urgency === 'critical';
            const isWarning = al.urgency === 'warning';

            const cardBorder = isCritical
              ? 'border-rose-300 dark:border-rose-900'
              : isWarning
              ? 'border-amber-300 dark:border-amber-900'
              : 'border-yellow-200 dark:border-yellow-900/50';

            const badgeBg = isCritical
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              : isWarning
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';

            return (
              <div
                key={al.id}
                className={`p-5 bg-white border ${cardBorder} rounded-2xl shadow-sm dark:bg-slate-900 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        {al.batch_id} • {al.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {al.product_name}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full flex-shrink-0 ${badgeBg}`}>
                      {al.days_until_expiry <= 0 ? 'Expires Today' : `${al.days_until_expiry} Days Left`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 my-3 bg-slate-50 rounded-xl dark:bg-slate-800/50 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Quantity At Risk</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {al.current_quantity} {al.unit}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Value At Risk</span>
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">
                        {currency} {al.value_at_risk.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Expiry Date:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{al.expiry_date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unit Cost:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Rs. {al.unit_cost}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDonateBatch(al);
                        setDonateQty(al.current_quantity);
                      }}
                      className="flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 transition flex items-center justify-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      Donate Batch
                    </button>
                    <button
                      onClick={() => setActiveTab('discounts')}
                      className="flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 transition flex items-center justify-center gap-1.5"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      Discount %
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Donate Modal */}
      <Modal
        isOpen={donateBatch !== null}
        onClose={() => setDonateBatch(null)}
        title="Donate Batch to Community Charity"
        icon={
          <span className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 block">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </span>
        }
        size="md"
        isDirty={donateBatch !== null && (donateQty !== donateBatch.current_quantity || recipientNgo !== 'Sahana Community Kitchen Colombo')}
        isSubmitting={donating}
        ariaLabel="Donate Batch to Charity"
      >
        {donateBatch && (
          <form onSubmit={handleDonateBatch} className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-semibold">Product & Batch</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {donateBatch.product_name} ({donateBatch.batch_id})
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">
                Quantity to Donate ({donateBatch.unit})
              </label>
              <input
                type="number"
                min="1"
                max={donateBatch.current_quantity}
                value={donateQty}
                onChange={(e) => setDonateQty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">
                Recipient Charity Partner
              </label>
              <select
                value={recipientNgo}
                onChange={(e) => setRecipientNgo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm"
              >
                <option value="Sahana Community Kitchen Colombo">Sahana Community Kitchen Colombo</option>
                <option value="Robin Hood Army Colombo">Robin Hood Army Colombo</option>
                <option value="Food for All Sri Lanka">Food for All Sri Lanka</option>
                <option value="Voice for Voiceless Foundation">Voice for Voiceless Foundation</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDonateBatch(null)}
                className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={donating}
                className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {donating ? 'Dispatching...' : 'Confirm Dispatch'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
