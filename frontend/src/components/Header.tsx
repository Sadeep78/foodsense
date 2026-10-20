import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Search,
  AlertTriangle,
  Sparkles,
  CheckCheck,
  Lightbulb,
  Target,
  Cpu,
  Store,
  Languages,
  ChevronDown,
  Tv,
  Presentation,
  Compass,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usePitchMode } from '../context/PitchModeContext';
import { DemoTourModal } from './DemoTourModal';
import { Popover } from './common/Popover';
import { Toast } from './common/Toast';
import { Modal } from './common/Modal';
import client from '../api/client';
import { ExpiryAlertSummary } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onRefreshData?: () => void;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: 'Alert' | 'Insight' | 'Goal' | 'System' | string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onRefreshData }) => {
  const { theme, toggleTheme } = useTheme();
  const { currency } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isPitchMode, togglePitchMode } = usePitchMode();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<ExpiryAlertSummary | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Alert' | 'Insight' | 'Goal' | 'System'>('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAlertsAndNotifications = async () => {
    try {
      const [alertsRes, notifsRes] = await Promise.all([
        client.get('/alerts/expiry').catch(() => ({ data: null })),
        client.get('/notifications').catch(() => ({ data: [] })),
      ]);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (notifsRes.data) setNotifications(notifsRes.data);
    } catch {
      // Quiet fail
    }
  };

  useEffect(() => {
    fetchAlertsAndNotifications();
    const interval = setInterval(fetchAlertsAndNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  // Global Ctrl+K / Cmd+K listener for Command Palette Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await client.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await client.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    handleMarkAsRead(item.id);
    setShowNotifications(false);
    if (item.link_url) {
      navigate(item.link_url);
    }
  };

  const handleLoadSampleData = async () => {
    try {
      setIsLoadingSample(true);
      const res = await client.post('/data/seed-sample-data?months=12');
      setFeedbackToast(
        `✓ ${res.data.sales_count} Sales & ${res.data.inventory_count} Batches Seeded Successfully!`
      );
      if (onRefreshData) onRefreshData();
      await fetchAlertsAndNotifications();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate sample data');
    } finally {
      setIsLoadingSample(false);
      setShowDemoMenu(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications =
    activeTab === 'All'
      ? notifications
      : notifications.filter((n) => n.category.toLowerCase() === activeTab.toLowerCase());

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'alert':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case 'insight':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-500" />;
      case 'goal':
        return <Target className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  const quickLinks = [
    { name: 'Dashboard Overview', path: '/', category: 'Analytics' },
    { name: 'Smart Insights Engine', path: '/insights', category: 'Intelligence' },
    { name: 'Demand Forecasts (Holt-Winters)', path: '/forecasts', category: 'Forecasting' },
    { name: 'Order Recommendations', path: '/recommendations', category: 'Operations' },
    { name: 'Expiry & Salvage Markdowns', path: '/alerts', category: 'Waste Prevention' },
    { name: 'Sustainability & ESG Scorecard', path: '/sustainability', category: 'Impact' },
    { name: 'Surplus Food Donations', path: '/donations', category: 'Redistribution' },
    { name: 'Multi-Outlet Leaderboard', path: '/outlets', category: 'Network' },
    { name: 'Supplier Price Watch', path: '/suppliers', category: 'Network' },
    { name: 'Recipe BOM Explosion', path: '/recipes', category: 'Kitchen' },
    { name: '10s Quick Waste Station', path: '/quick-log', category: 'Kitchen' },
    { name: 'Data Upload & Validation', path: '/upload', category: 'Data' },
    { name: 'Business Settings', path: '/settings', category: 'Admin' },
  ];

  const filteredQuickLinks = searchQuery.trim()
    ? quickLinks.filter((l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickLinks;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-all select-none">
      {/* Left section: mobile toggle & Command Search Button */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Linear / Stripe-style Cmd+K Command Search trigger */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 w-full max-w-xs sm:max-w-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 text-xs transition-all shadow-xs"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate flex-1 text-left">Search pages, metrics, batches...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-slate-500 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Pitch Mode, Demo Menu, Language, Currency, Notifications, Theme */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Pitch Mode Toggle */}
        <button
          type="button"
          onClick={togglePitchMode}
          title={isPitchMode ? 'Exit Pitch / Presentation Mode' : 'Enter Pitch / Presentation Mode'}
          aria-label="Toggle presentation pitch mode"
          className={`flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-semibold transition-all border ${
            isPitchMode
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200/70 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-800'
          }`}
        >
          <Presentation className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xl:inline">{isPitchMode ? 'Pitch Mode Active' : 'Pitch View'}</span>
        </button>

        {/* Consolidated "Demo" Menu Dropdown */}
        <Popover
          isOpen={showDemoMenu}
          onOpen={() => setShowDemoMenu(true)}
          onClose={() => setShowDemoMenu(false)}
          onToggle={() => setShowDemoMenu((prev) => !prev)}
          placement="bottom-right"
          className="w-64"
          trigger={({ ref, onClick, 'aria-expanded': ariaExpanded, 'aria-haspopup': ariaHasPopup }) => (
            <button
              ref={ref}
              type="button"
              onClick={onClick}
              aria-expanded={ariaExpanded}
              aria-haspopup={ariaHasPopup}
              aria-label="Demo tools and sample data"
              title="Demo Evaluation Controls"
              className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/80 rounded-xl dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Demo Tools</span>
              <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
            </button>
          )}
        >
          <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-1 text-xs">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              Evaluation & Presentation
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDemoMenu(false);
                setIsTourOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Academic Pitch Tour</p>
                <p className="text-[10px] text-slate-400">Step-by-step panel walkthrough</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLoadSampleData}
              disabled={isLoadingSample}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors disabled:opacity-50"
            >
              {isLoadingSample ? (
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
              ) : (
                <Database className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <div>
                <p className="font-bold">{isLoadingSample ? 'Generating 12 Mo...' : 'Re-Seed Sample Data'}</p>
                <p className="text-[10px] text-slate-400">12 months realistic Sri Lankan items</p>
              </div>
            </button>
          </div>
        </Popover>

        {/* Multi-Language Switcher (EN, SI, TA) */}
        <div className="hidden sm:flex items-center gap-1 h-8 px-2.5 text-xs font-semibold bg-slate-100/90 text-slate-700 rounded-xl border border-slate-200/60 dark:bg-slate-800/70 dark:border-slate-700/60 dark:text-slate-300">
          <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            aria-label="Language Selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">EN</option>
            <option value="si" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">සිං (SI)</option>
            <option value="ta" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">தம (TA)</option>
          </select>
        </div>

        {/* Currency Badge */}
        <div className="hidden md:flex items-center h-8 px-2.5 text-xs font-semibold bg-slate-100/90 text-slate-700 rounded-xl border border-slate-200/60 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700/60">
          <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-1">Rs.</span>
          {currency}
        </div>

        {/* Notification Bell Dropdown using Popover */}
        <Popover
          isOpen={showNotifications}
          onOpen={() => setShowNotifications(true)}
          onClose={() => setShowNotifications(false)}
          onToggle={() => setShowNotifications((prev) => !prev)}
          placement="bottom-right"
          trigger={({ ref, onClick, 'aria-expanded': ariaExpanded, 'aria-haspopup': ariaHasPopup }) => (
            <button
              ref={ref}
              onClick={onClick}
              aria-expanded={ariaExpanded}
              aria-haspopup={ariaHasPopup}
              aria-label="Notification Centre"
              className="relative h-8 w-8 flex items-center justify-center text-slate-600 rounded-xl hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Notification Centre"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-3.5 h-3.5 px-0.5 text-[9px] font-bold text-white bg-rose-600 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
        >
          <div className="w-80 sm:w-96 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl dark:bg-slate-900 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notification Centre
                </span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark read</span>
                  </button>
                )}
                <span className="px-2 py-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 rounded-full dark:bg-rose-950 dark:text-rose-300">
                  {unreadCount} New
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 mb-2 bg-slate-50 rounded-xl dark:bg-slate-800/60 text-xs">
              {(['All', 'Alert', 'Insight', 'Goal', 'System'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-white shadow-xs text-slate-900 dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-2 mt-2 max-h-72 overflow-y-auto pr-0.5">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                      notif.is_read
                        ? 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 opacity-75'
                        : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white truncate">
                        {getCategoryIcon(notif.category)}
                        <span className="truncate">{notif.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.created_at}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-slate-400">
                  No notifications in this category.
                </p>
              )}
            </div>

            {/* Footer View Link */}
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
              <Link
                to="/alerts"
                onClick={() => setShowNotifications(false)}
                className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                View Expiry Alerts ({alerts?.alerts?.length || 0})
              </Link>
              <Link
                to="/insights"
                onClick={() => setShowNotifications(false)}
                className="font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400"
              >
                View Smart Insights →
              </Link>
            </div>
          </div>
        </Popover>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="h-8 w-8 flex items-center justify-center text-slate-600 rounded-xl hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle dark/light theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Global Command Palette / Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        size="lg"
        showCloseButton={false}
        ariaLabel="Global command palette search"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search FoodSense pages, analytics, or batch actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Navigation
            </div>
            {filteredQuickLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  navigate(link.path);
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <Compass className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="font-semibold block">{link.name}</span>
                    <span className="text-[10px] text-slate-400">{link.category}</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">ESC</kbd> to exit</span>
            <span>FoodSense Enterprise Search</span>
          </div>
        </div>
      </Modal>

      {/* Accessible feedback toast */}
      <Toast
        message={feedbackToast}
        onClose={() => setFeedbackToast(null)}
        type="success"
      />

      {/* Interactive Academic Pitch Tour Modal */}
      <DemoTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </header>
  );
};
