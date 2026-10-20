import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  Heart,
  Users,
  Scale,
  Award,
  PlusCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  FileText,
  X,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { DonationsOverviewResponse, DonationRecord, DonationPartner } from '../types';
import { Modal } from '../components/common/Modal';

export const DonationsPage: React.FC = () => {
  const [data, setData] = useState<DonationsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState('packs');
  const [estimatedValue, setEstimatedValue] = useState<number>(3500);
  const [recipientNgo, setRecipientNgo] = useState('Sahana Community Kitchen Colombo');
  const [receiptNote, setReceiptNote] = useState('');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await client.get<DonationsOverviewResponse>('/donations');
      setData(res.data);
      if (res.data?.partners?.length > 0 && !recipientNgo) {
        setRecipientNgo(res.data.partners[0].name);
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || quantity <= 0) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await client.post('/donations', {
        product_id: 'CUSTOM-DONATION',
        product_name: productName,
        quantity: Number(quantity),
        unit: unit,
        estimated_value_lkr: Number(estimatedValue),
        recipient_ngo: recipientNgo,
        receipt_note: receiptNote || 'Logged via FoodSense Food Redistribution Hub',
      });
      setIsModalOpen(false);
      setProductName('');
      setReceiptNote('');
      await fetchDonations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to log donation');
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
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Food Donation & Redistribution Tracker
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Diverting short-dated edible food to verified Sri Lankan food banks and soup kitchens.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Log Surplus Donation
        </button>
      </div>

      {/* Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Meals Donated
            </span>
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {(data?.total_meals_donated || 0).toLocaleString()}
            </span>
            <p className="mt-1 text-xs text-slate-500">Nutritional portions provided</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Landfill Diverted
            </span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {(data?.total_kg_diverted || 0).toLocaleString()} kg
            </span>
            <p className="mt-1 text-xs text-slate-500">Clean organic mass rescued</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Redistributed Value
            </span>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Rs. {(data?.total_value_lkr || 0).toLocaleString()}
            </span>
            <p className="mt-1 text-xs text-slate-500">Fair retail donation equivalence</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Charity Partners
            </span>
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {data?.partner_count || 0} NGOs
            </span>
            <p className="mt-1 text-xs text-slate-500">Community distribution network</p>
          </div>
        </div>
      </div>

      {/* Partner Directory */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-600" />
          Registered Sri Lankan Charity & NGO Partners
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data?.partners || []).map((partner) => (
            <div
              key={partner.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> VERIFIED
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {partner.total_meals_received} meals
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mt-2 text-sm leading-tight">
                  {partner.name}
                </h3>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-0.5">
                  {partner.partner_type}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {partner.contact_person && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{partner.contact_person}</span>
                    </div>
                  )}
                  {partner.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{partner.phone}</span>
                    </div>
                  )}
                  {partner.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{partner.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Donation History Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Recent Redistribution Log
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {data?.recent_donations.length || 0} batches recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Food Product</th>
                <th className="px-5 py-3.5">Quantity Diverted</th>
                <th className="px-5 py-3.5">Fair Value (LKR)</th>
                <th className="px-5 py-3.5">Recipient Organization</th>
                <th className="px-5 py-3.5">Receipt / Distribution Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {(data?.recent_donations || []).map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                    {record.date}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    {record.product_name}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {record.quantity} {record.unit}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold text-slate-900 dark:text-white">
                    Rs. {record.estimated_value_lkr.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-medium text-brand-700 dark:text-brand-300">
                    {record.recipient_ngo}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                    {record.receipt_note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Donation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Surplus Food Donation"
        icon={
          <span className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 block">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </span>
        }
        size="lg"
        isDirty={Boolean(productName.trim() || receiptNote.trim() || quantity !== 10 || estimatedValue !== 3500)}
        isSubmitting={submitting}
        ariaLabel="Log Surplus Food Donation"
      >
        <form onSubmit={handleCreateDonation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Food Item / Prepared Dish
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh Wood-Fired Roast Paan (Surplus)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="portions">Portions</option>
                <option value="packs">Packs</option>
                <option value="loaves">Loaves</option>
                <option value="kg">kg</option>
                <option value="cartons">Cartons</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Estimated Commercial Value (LKR)
            </label>
            <input
              type="number"
              min="0"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Recipient Community Partner
            </label>
            <select
              value={recipientNgo}
              onChange={(e) => setRecipientNgo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
            >
              {(data?.partners || []).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.partner_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Distribution / Delivery Note
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Collected by Robin Hood Army volunteer team at 9 PM for night feeding program."
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
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
              {submitting ? 'Recording...' : 'Confirm Redistribution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
