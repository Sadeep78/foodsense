import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  Scale,
  DollarSign,
  ChefHat,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Product } from '../types';

interface QuickLogHistory {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  reason: string;
  cost: number;
  time: string;
}

export const QuickLogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1.0);
  const [wasteReason, setWasteReason] = useState('Prep Trim');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<QuickLogHistory[]>([
    {
      id: 'log-1',
      product_name: 'Wood-Fired Roast Paan',
      quantity: 1.5,
      unit: 'loaves',
      reason: 'Prep Trim',
      cost: 525,
      time: '11:42 AM',
    },
    {
      id: 'log-2',
      product_name: 'Fresh Broiler Chicken Curry Cut',
      quantity: 0.8,
      unit: 'kg',
      reason: 'Overcooked',
      cost: 1040,
      time: '11:15 AM',
    },
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await client.get<Product[]>('/products');
      setProducts(res.data);
      if (res.data.length > 0) {
        setSelectedProduct(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load products for quick log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['All', 'Cooked Meals', 'Bakery', 'Vegetables', 'Meat & Fish', 'Dairy', 'Fruits'];
  const wasteReasons = [
    { label: 'Prep Trim', desc: 'Trimming, peeling & prep loss' },
    { label: 'Overcooked', desc: 'Burnt or scorched kitchen batch' },
    { label: 'Expired', desc: 'Exceeded safe shelf-life window' },
    { label: 'Damaged / Spilled', desc: 'Dropped, spilled or broken batch' },
    { label: 'Customer Plate Waste', desc: 'Uneaten table return' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchQuery =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setSubmitting(true);
      const res = await client.post('/data/quick-waste-log', {
        product_id: selectedProduct.product_id,
        quantity_wasted: Number(quantity),
        waste_reason: wasteReason,
        notes,
      });

      setSuccessBanner(res.data);
      setRecentLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          product_name: res.data.product_name,
          quantity: res.data.quantity_wasted,
          unit: res.data.unit,
          reason: res.data.waste_reason,
          cost: res.data.waste_cost_lkr,
          time: res.data.logged_at,
        },
        ...prev.slice(0, 4),
      ]);

      // Reset
      setQuantity(1.0);
      setNotes('');
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error('Failed to log waste:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedLoss = selectedProduct ? (selectedProduct.unit_cost || 300) * quantity : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 rounded-2xl shadow-xl text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-2">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen Terminal Mode (10-Second Quick Log)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Rapid Kitchen Waste Entry Station
          </h1>
          <p className="text-rose-100/90 text-xs mt-1">
            Touch-optimized interface designed for kitchen wall screens & line tablets to instantly record prep waste and discarded batches.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/25 px-4 py-3 rounded-xl border border-white/10 self-start md:self-auto">
          <Clock className="w-4 h-4 text-rose-300" />
          <span className="text-xs font-mono font-bold">Shift: Morning Prep (08:00 - 16:00)</span>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 shadow-lg text-xs flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">
                {successBanner.message}
              </p>
              <p className="text-emerald-700 dark:text-emerald-300 text-[11px] mt-0.5">
                Financial Impact: Rs. {successBanner.waste_cost_lkr.toLocaleString()} • Logged at {successBanner.logged_at}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold rounded-lg uppercase text-[10px]">
            Saved to Ledger
          </span>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selection Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>1. Select Ingredient or Dish</span>
              </h3>
              <span className="text-xs text-slate-400">
                {filteredProducts.length} items
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Type ingredient or dish name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Product Card Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
              {filteredProducts.map((p) => {
                const isSelected = selectedProduct?.product_id === p.product_id;
                return (
                  <button
                    key={p.product_id}
                    onClick={() => setSelectedProduct(p)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-slate-50/70 dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {p.category}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      Rs. {p.unit_cost || 0} / {p.unit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Quantity & Reason Action Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleQuickLog}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>2. Quantity & Waste Reason</span>
            </h3>

            {/* Selected Product Banner */}
            {selectedProduct && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Selected</span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {selectedProduct.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {selectedProduct.unit}
                </span>
              </div>
            )}

            {/* Quick Quantity Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Quantity Discarded ({selectedProduct?.unit || 'units'}):
              </label>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {[0.5, 1.0, 2.0, 5.0, 10.0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      quantity === preset
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-bold text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Reason Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Root Cause:
              </label>
              <div className="space-y-1.5">
                {wasteReasons.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setWasteReason(r.label)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs border text-left transition-all ${
                      wasteReason === r.label
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loss Preview */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs flex items-center justify-between">
              <span className="text-amber-800 dark:text-amber-300 font-medium">Estimated Financial Loss:</span>
              <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400 font-mono">
                Rs. {estimatedLoss.toLocaleString()}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedProduct}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{submitting ? 'Recording Waste...' : '1-Tap Confirm & Log Waste'}</span>
            </button>
          </form>

          {/* Recent Shift Logs */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Recent Logs (This Shift)
            </span>
            <div className="space-y-1.5">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {log.quantity} {log.unit} • {log.product_name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {log.reason} • {log.time}
                    </span>
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                    Rs. {log.cost.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
