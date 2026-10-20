import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Sliders,
  Leaf,
  Save,
  CheckCircle2,
  RefreshCw,
  Coins,
} from 'lucide-react';
import client from '../api/client';
import { SettingsData } from '../types';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { setCurrency: setGlobalCurrency } = useAuth();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await client.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setToast(null);

    try {
      const res = await client.put('/settings', settings);
      setSettings(res.data);
      setGlobalCurrency(res.data.currency);
      setToast('System settings and business profile updated successfully!');
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      setToast(err.response?.data?.detail || 'Failed to update settings.');
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading system configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Platform & Inventory Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tune algorithmic forecasting rules, currency standards, and business profile.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Store className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Business Profile & Currency
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business / Enterprise Name
              </label>
              <input
                type="text"
                required
                value={settings?.business_name || ''}
                onChange={(e) => setSettings({ ...settings!, business_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operation Type
              </label>
              <select
                value={settings?.business_type || 'Restaurant'}
                onChange={(e) => setSettings({ ...settings!, business_type: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="Restaurant">Restaurant & Commercial Kitchen</option>
                <option value="Supermarket">Supermarket & Fresh Produce Retail</option>
                <option value="Bakery & Cafe">Bakery & Cafe</option>
                <option value="Hotel F&B">Hotel Food & Beverage Outlet</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operating Currency
              </label>
              <select
                value={settings?.currency || 'LKR'}
                onChange={(e) => setSettings({ ...settings!, currency: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-bold"
              >
                <option value="LKR">LKR — Sri Lankan Rupee (Rs.)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="INR">INR — Indian Rupee (₹)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Outlet / Store Branch
              </label>
              <input
                type="text"
                value={settings?.outlet_name || ''}
                onChange={(e) => setSettings({ ...settings!, outlet_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location Address
              </label>
              <input
                type="text"
                value={settings?.address || ''}
                onChange={(e) => setSettings({ ...settings!, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Algorithmic Inventory Parameters */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Safety Stock & Lead Time Defaults
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Safety Stock Buffer (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={settings?.default_safety_stock_pct || 15}
                onChange={(e) =>
                  setSettings({ ...settings!, default_safety_stock_pct: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Percentage added to lead-time demand to absorb peak weekend surges.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Supplier Lead Time (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={settings?.default_lead_time_days || 2}
                onChange={(e) =>
                  setSettings({ ...settings!, default_lead_time_days: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Standard days required from purchase order dispatch to shelf delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Expiry Alert Thresholds & CO2 Factors */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Leaf className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Alert Windows & Environmental Multipliers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Critical Alert (Red)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={settings?.alert_days_urgent || 1}
                onChange={(e) =>
                  setSettings({ ...settings!, alert_days_urgent: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Days to expiry</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Warning Alert (Orange)
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={settings?.alert_days_warning || 3}
                onChange={(e) =>
                  setSettings({ ...settings!, alert_days_warning: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Days to expiry</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CO2 Emission Factor (kg CO2e / kg food)
              </label>
              <input
                type="number"
                step={0.1}
                min={0.5}
                max={10.0}
                value={settings?.co2_factor_food_waste || 2.5}
                onChange={(e) =>
                  setSettings({ ...settings!, co2_factor_food_waste: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Global food waste factor</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 transition-all"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
