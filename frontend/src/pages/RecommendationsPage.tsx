import React, { useState, useEffect } from 'react';
import {
  Download,
  Sliders,
  RefreshCw,
  Search,
  Save,
} from 'lucide-react';
import client from '../api/client';
import { RecommendationResponse, RecommendationItem } from '../types';
import { Modal } from '../components/common/Modal';

export const RecommendationsPage: React.FC = () => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingProduct, setEditingProduct] = useState<RecommendationItem | null>(null);
  const [editForm, setEditForm] = useState({
    lead_time_days: 1,
    safety_stock_pct: 15.0,
    pack_size: 1,
    shelf_life_days: 3,
  });
  const [savingParam, setSavingParam] = useState<boolean>(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await client.get('/recommendations');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleEditClick = (item: RecommendationItem) => {
    setEditingProduct(item);
    setEditForm({
      lead_time_days: item.lead_time_days,
      safety_stock_pct: item.safety_stock_pct,
      pack_size: item.pack_size,
      shelf_life_days: 3,
    });
  };

  const handleSaveParams = async () => {
    if (!editingProduct) return;
    setSavingParam(true);
    try {
      await client.put(`/products/${editingProduct.product_id}`, editForm);
      setEditingProduct(null);
      await fetchRecommendations();
    } catch (err) {
      console.error('Failed to update product params:', err);
    } finally {
      setSavingParam(false);
    }
  };

  const handleExportCSV = () => {
    window.open('http://localhost:8000/recommendations/export', '_blank');
  };

  const currency = data?.currency || 'LKR';

  const filteredItems = (data?.recommendations || []).filter((item) => {
    const matchesSearch =
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Summary Spend */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Automated Ordering Recommendations
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold text-brand-700 bg-brand-100 rounded-full dark:bg-brand-950 dark:text-brand-300">
              Formula-Driven
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Order Qty = Forecasted Demand (Lead Time) + Safety Stock - Usable Stock, rounded up to pack sizes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Total Recommended Spend
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {currency} {data?.total_estimated_spend.toLocaleString() || '0'}
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Order List (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or SKU..."
            className="w-full pl-10 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
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

          <button
            onClick={fetchRecommendations}
            title="Refresh Recommendations"
            className="p-2 text-slate-500 hover:text-brand-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Product Name & Category</th>
                <th className="px-4 py-3 text-right">Current Usable</th>
                <th className="px-4 py-3 text-right">Expiring &lt;2d</th>
                <th className="px-4 py-3 text-right">Forecast Need</th>
                <th className="px-4 py-3 text-right">Recommended Order</th>
                <th className="px-4 py-3 text-right">Est. Spend ({currency})</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3">Algorithmic Explanation</th>
                <th className="px-4 py-3 text-center">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {item.product_name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {item.product_id} • {item.category} • Pack Size: {item.pack_size}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    {item.current_usable_stock} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">
                    {item.expiring_soon_stock > 0 ? `${item.expiring_soon_stock} ${item.unit}` : '0'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    {item.forecasted_demand_lead_time} {item.unit}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      +{item.safety_stock_pct}% safety
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-brand-700 dark:text-brand-400 text-sm">
                    {item.recommended_order > 0 ? `${item.recommended_order} ${item.unit}` : '0'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                    {item.estimated_order_cost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        item.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : item.priority === 'Normal'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                    {item.reason}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEditClick(item)}
                      title="Configure lead time & safety stock"
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parameter Edit Modal */}
      <Modal
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        title="Tune Inventory Parameters"
        subtitle={editingProduct ? editingProduct.product_name : undefined}
        icon={
          <span className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 block">
            <Sliders className="w-5 h-5" />
          </span>
        }
        size="md"
        isDirty={
          editingProduct !== null &&
          (editForm.lead_time_days !== editingProduct.lead_time_days ||
            editForm.safety_stock_pct !== editingProduct.safety_stock_pct ||
            editForm.pack_size !== editingProduct.pack_size)
        }
        isSubmitting={savingParam}
        ariaLabel="Tune Inventory Parameters"
      >
        {editingProduct && (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supplier Lead Time (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={editForm.lead_time_days}
                onChange={(e) => setEditForm({ ...editForm, lead_time_days: Number(e.target.value) })}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Safety Stock Buffer (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={editForm.safety_stock_pct}
                onChange={(e) => setEditForm({ ...editForm, safety_stock_pct: Number(e.target.value) })}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pack Size (Rounding Multiplier)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={editForm.pack_size}
                onChange={(e) => setEditForm({ ...editForm, pack_size: Number(e.target.value) })}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveParams}
                disabled={savingParam}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {savingParam ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Parameters & Recalculate</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
