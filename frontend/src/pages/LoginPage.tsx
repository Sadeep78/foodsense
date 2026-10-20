import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      navigate('/');
    } else {
      setErrorMsg('Invalid email or password. You can click "Fill Demo Credentials" below.');
    }
  };

  const fillRoleCredentials = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('demo1234');
    setErrorMsg(null);
    setIsSubmitting(true);
    const success = await login(roleEmail, 'demo1234');
    setIsSubmitting(false);
    if (success) {
      navigate('/');
    }
  };

  const fillDemoCredentials = async () => {
    await fillRoleCredentials('manager@foodsense.lk');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left Hero Pane (Visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-950 via-brand-950 to-slate-900 p-12 flex-col justify-between text-white overflow-hidden">
        {/* Abstract decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-white shadow-lg shadow-brand-500/30">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">FoodSense</h1>
            <p className="text-xs text-emerald-300">Demand & Waste Intelligence Dashboard</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SLIIT University Research Prototype</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
            Prevent Food Spoilage with Precision Demand Forecasting
          </h2>
          <p className="text-sm text-emerald-200/80 leading-relaxed">
            Designed specifically for Sri Lankan restaurants and supermarkets to eliminate guesswork in ordering, optimize inventory levels, and slash landfill food waste.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Holt-Winters weekly seasonality demand forecasting engine',
              'Smart automated order quantities with safety stock buffers',
              'Real-time color-coded perishable expiry risk alerts',
              'Simulate bottom-line savings and carbon emission reductions',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-emerald-300/60">
          Faculty of Computing • Department of Data Science & Business Analytics
        </div>
      </div>

      {/* Right Login Pane */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                Food<span className="text-brand-600">Sense</span>
              </span>
              <p className="text-[11px] text-slate-500">SLIIT Prototype Demo</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sign in to your manager portal
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Access demand analytics, ordering recommendations, and expiry alerts.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-5 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@foodsense.lk"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Preset Button */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Panel Evaluation Demo
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                  Pre-Configured
                </span>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mb-3">
                Pre-loaded with sample store credentials: <br />
                <code className="font-mono text-[11px] font-semibold">manager@foodsense.lk / demo1234</code>
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Store Manager (1-Click Login)</span>
                </button>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('admin@foodsense.lk')}
                    disabled={isSubmitting}
                    className="py-1.5 px-2 text-[11px] font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 rounded-lg text-center transition-all"
                  >
                    System Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('staff@foodsense.lk')}
                    disabled={isSubmitting}
                    className="py-1.5 px-2 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 rounded-lg text-center transition-all"
                  >
                    Kitchen Staff
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
