import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  Truck,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Modal } from '../components/common/Modal';

interface SupplierItem {
  id: number;
  supplier_id: string;
  name: string;
  category: string;
  contact_name: string;
  phone: string;
  email: string;
  lead_time_days: number;
  on_time_delivery_pct: number;
  quality_score: number;
  has_price_spike: boolean;
  spike_detail?: string;
}

interface PriceHistoryEntry {
  effective_date: string;
  product_id: string;
  price: number;
}

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [priceHistoryLoading, setPriceHistoryLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Produce');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [leadTime, setLeadTime] = useState(2);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await client.get<SupplierItem[]>('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenPriceHistory = async (supplier: SupplierItem) => {
    setSelectedSupplier(supplier);
    try {
      setPriceHistoryLoading(true);
      const res = await client.get(`/suppliers/${supplier.supplier_id}/prices`);
      setPriceHistory(res.data.price_history || []);
    } catch (err) {
      console.error('Failed to load supplier price history:', err);
    } finally {
      setPriceHistoryLoading(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await client.post('/suppliers', {
        supplier_id: supplierId,
        name,
        category,
        contact_name: contactName,
        phone,
        email,
        lead_time_days: Number(leadTime),
      });
      setIsAddModalOpen(false);
      setSupplierId('');
      setName('');
      setContactName('');
      setPhone('');
      setEmail('');
      fetchSuppliers();
    } catch (err) {
      console.error('Failed to add supplier:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading supplier network & price histories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Procurement & Vendor Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Supplier Directory & Price Spikes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor vendor reliability scores, fulfillment lead times, and commodity price trends across Sri Lankan suppliers.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {sup.supplier_id}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {sup.category}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                {sup.name}
              </h3>

              {/* Price Spike Warning if detected */}
              {sup.has_price_spike && (
                <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium leading-tight">
                    {sup.spike_detail}
                  </span>
                </div>
              )}

              {/* Reliability Stats */}
              <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">On-Time Delivery</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {sup.on_time_delivery_pct}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quality Rating</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {sup.quality_score} / 10
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Lead Time:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {sup.lead_time_days} days
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Contact: {sup.contact_name}
                </p>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{sup.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenPriceHistory(sup)}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Inspect Price Trajectory</span>
            </button>
          </div>
        ))}
      </div>

      {/* Price History Chart Modal */}
      <Modal
        isOpen={selectedSupplier !== null}
        onClose={() => setSelectedSupplier(null)}
        title="12-Week Procurement Price History"
        subtitle={selectedSupplier ? `${selectedSupplier.name} (${selectedSupplier.supplier_id})` : undefined}
        icon={
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 block">
            <Truck className="w-5 h-5" />
          </span>
        }
        size="2xl"
        isDirty={false}
        ariaLabel="12-Week Procurement Price History"
      >
        <div className="space-y-4 pt-1">
          {priceHistoryLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading price series...
            </div>
          ) : priceHistory.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                    <XAxis dataKey="effective_date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" Rs." />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Unit Price (LKR)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Earliest Price: Rs. {priceHistory[0]?.price}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Latest Price: Rs. {priceHistory[priceHistory.length - 1]?.price}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No price history records recorded yet for this vendor.
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedSupplier(null)}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vendor"
        icon={
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 block">
            <Truck className="w-5 h-5" />
          </span>
        }
        size="md"
        isDirty={Boolean(supplierId.trim() || name.trim() || category.trim() || contactName.trim() || phone.trim() || email.trim() || leadTime !== 2)}
        isSubmitting={submitting}
        ariaLabel="Add New Vendor"
      >
        <form onSubmit={handleAddSupplier} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supplier ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SUP-006"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vendor Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ruhunu Spice Mills"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Spices & Condiments"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              placeholder="e.g. Rohitha Perera"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="text"
                placeholder="+94 11 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lead Time (Days)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="e.g. orders@ruhunu.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
