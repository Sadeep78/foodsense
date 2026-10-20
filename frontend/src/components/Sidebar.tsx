import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  FileBarChart2,
  Settings,
  LogOut,
  Sprout,
  Sparkles,
  Heart,
  Target,
  PieChart,
  Calendar,
  Leaf,
  Store,
  Truck,
  UtensilsCrossed,
  ChefHat,
  X,
  ChevronDown,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSidebar } from '../context/SidebarContext';
import { Drawer } from './common/Drawer';
import { Popover } from './common/Popover';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [selectedOutlet, setSelectedOutlet] = useState<string>('OUT-CMB');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);

  const navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { name: t('nav.dashboard'), path: '/', icon: LayoutDashboard },
        { name: t('nav.insights'), path: '/insights', icon: Sparkles },
      ],
    },
    {
      label: 'Operations',
      items: [
        { name: t('nav.forecasts'), path: '/forecasts', icon: TrendingUp },
        { name: t('nav.recommendations'), path: '/recommendations', icon: ShoppingCart },
        { name: t('nav.alerts'), path: '/alerts', icon: AlertTriangle },
        { name: t('nav.quick_log'), path: '/quick-log', icon: ChefHat },
        { name: t('nav.recipes'), path: '/recipes', icon: UtensilsCrossed },
      ],
    },
    {
      label: 'Impact & Analytics',
      items: [
        { name: t('nav.sustainability'), path: '/sustainability', icon: Leaf },
        { name: t('nav.donations'), path: '/donations', icon: Heart },
        { name: t('nav.goals'), path: '/goals', icon: Target },
        { name: t('nav.margins'), path: '/margins', icon: PieChart },
        { name: t('nav.reports'), path: '/reports', icon: FileBarChart2 },
        { name: t('nav.events'), path: '/events', icon: Calendar },
      ],
    },
    {
      label: 'Network & System',
      items: [
        { name: t('nav.outlets'), path: '/outlets', icon: Store },
        { name: t('nav.suppliers'), path: '/suppliers', icon: Truck },
        { name: t('nav.upload'), path: '/upload', icon: UploadCloud },
        { name: t('nav.settings'), path: '/settings', icon: Settings },
      ],
    },
  ];

  // Render navigation item
  const renderNavLink = (item: NavItem, collapsed: boolean, onNavClick?: () => void) => {
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === '/'}
        onClick={onNavClick}
        title={collapsed ? item.name : undefined}
        className={({ isActive }) =>
          `group relative flex items-center ${
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2'
          } rounded-xl text-xs font-semibold transition-all duration-150 ${
            isActive
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs border-l-[3px] border-emerald-600'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
          }`
        }
      >
        <item.icon
          className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110`}
        />
        {!collapsed && <span className="truncate">{item.name}</span>}

        {/* Floating tooltip when collapsed on desktop */}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
            {item.name}
          </div>
        )}
      </NavLink>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'NP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Reusable Sidebar Core
  const renderSidebarContent = (collapsed: boolean, onNavClick?: () => void) => {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800/90 transition-all duration-200 select-none">
        {/* Brand & Collapse Header */}
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center' : 'justify-between'
          } px-4 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-500/20 shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-slate-900 tracking-tight dark:text-white">
                    Food<span className="text-emerald-600 dark:text-emerald-400">Sense</span>
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold tracking-wider text-emerald-800 bg-emerald-100 rounded dark:bg-emerald-950 dark:text-emerald-300">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  Demand & Waste Intelligence
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          {onNavClick && (
            <button
              type="button"
              onClick={onNavClick}
              aria-label="Close navigation"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Outlet Switcher at Top of Sidebar */}
        {!collapsed ? (
          <div className="px-3 pt-3 shrink-0">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700/60 text-xs">
              <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Active Branch
                </label>
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
                >
                  <option value="OUT-CMB" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Colombo Central</option>
                  <option value="OUT-KDY" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Kandy Hillside</option>
                  <option value="OUT-GLE" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Galle Fort</option>
                  <option value="ALL" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">All Branches (Chain)</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 flex justify-center shrink-0" title={`Active Branch: ${selectedOutlet}`}>
            <span className="p-2 rounded-xl bg-slate-100 text-emerald-600 dark:bg-slate-800 dark:text-emerald-400">
              <Store className="w-4 h-4" />
            </span>
          </div>
        )}

        {/* Grouped Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <div className="px-2 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => renderNavLink(item, collapsed, onNavClick))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile & Account Footer with Dropdown Menu */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <Popover
            isOpen={profileDropdownOpen}
            onOpen={() => setProfileDropdownOpen(true)}
            onClose={() => setProfileDropdownOpen(false)}
            onToggle={() => setProfileDropdownOpen((prev) => !prev)}
            placement="top-right"
            wrapperClassName="w-full block"
            className="w-64 mb-2"
            trigger={({ ref, onClick, 'aria-expanded': ariaExpanded, 'aria-haspopup': ariaHasPopup }) => (
              <button
                ref={ref}
                type="button"
                onClick={onClick}
                aria-expanded={ariaExpanded}
                aria-haspopup={ariaHasPopup}
                aria-label="User account menu"
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-2'
                } rounded-xl bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-700/50 group`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 ring-1 ring-emerald-600/20">
                    {getInitials(user?.user_name || 'Nimsara Perera')}
                  </div>

                  {!collapsed && (
                    <div className="flex flex-col justify-center min-w-0 flex-1 text-left">
                      <p
                        className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight"
                        title={user?.user_name || 'Nimsara Perera'}
                      >
                        {user?.user_name || 'Nimsara Perera'}
                      </p>
                      <p
                        className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5 tracking-tight"
                        title={user?.role || 'Store Manager & Head of Procurement'}
                      >
                        {user?.role || 'Store Manager & Head of Procurement'}
                      </p>
                    </div>
                  )}
                </div>

                {!collapsed && (
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 ml-2 transition-colors" />
                )}
              </button>
            )}
          >
            <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-1 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {user?.user_name || 'Nimsara Perera'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'manager@foodsense.lk'}
                </p>
                <div className="mt-1.5">
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md border border-emerald-200/50 dark:border-emerald-800/40 truncate max-w-full">
                    {user?.role || 'Store Manager & Head of Procurement'}
                  </span>
                </div>
              </div>

              <Link
                to="/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account & Business Settings</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </Popover>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex fixed top-0 bottom-0 left-0 z-30 flex-col ${
          isCollapsed ? 'w-20' : 'w-[280px]'
        } transition-all duration-200 ease-in-out`}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer Overlay */}
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        position="left"
        ariaLabel="Main Navigation Menu"
        widthClass="w-72"
      >
        {renderSidebarContent(false, onClose)}
      </Drawer>
    </>
  );
};
