import React, { useState, useRef, useEffect } from 'react';
import {
  AlignJustify,
  Home,
  Users,
  ShoppingBag,
  CreditCard,
  Pencil,
  Tag,
  Settings,
  LogOut,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { View, Merchant } from '../types';

interface SidebarProps {
  view?: View;
  currentView?: View;
  setView?: (v: View) => void;
  onNavigate?: (v: View) => void;
  isAgency?: boolean;
  collapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
  currentMerchant: Merchant;
  merchants: Merchant[];
  onSelectMerchant: (m: Merchant) => void;
  onSwitchToAgency: () => void;
}

export default function Sidebar({
  view,
  currentView,
  setView,
  onNavigate,
  isAgency: propIsAgency,
  collapsed: propCollapsed,
  setCollapsed: propSetCollapsed,
  currentMerchant,
  merchants,
  onSelectMerchant,
  onSwitchToAgency,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [searchAccount, setSearchAccount] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeView: View = currentView || view || 'agency';
  const navigate = (v: View) => {
    if (onNavigate) onNavigate(v);
    if (setView) setView(v);
  };

  const isCollapsed = propCollapsed !== undefined ? propCollapsed : internalCollapsed;
  const toggleCollapsed = () => {
    if (propSetCollapsed) propSetCollapsed(!isCollapsed);
    else setInternalCollapsed(!internalCollapsed);
  };

  const isAgency =
    propIsAgency !== undefined
      ? propIsAgency
      : activeView === 'agency' || activeView === 'whitelabel' || activeView === 'settings';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setWorkspaceOpen(false);
      }
    }
    if (workspaceOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [workspaceOpen]);

  const agencyNav: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'agency', label: 'My Apps', icon: <Tag size={18} /> },
    { id: 'whitelabel', label: 'White Label', icon: <Tag size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const merchantNav: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'merchant', label: 'Home', icon: <Home size={18} /> },
    { id: 'clients', label: 'Client Profiles', icon: <Users size={18} /> },
    { id: 'shop', label: 'Shop Summary', icon: <ShoppingBag size={18} /> },
    { id: 'memberships', label: 'Memberships', icon: <CreditCard size={18} /> },
    { id: 'appbuilder', label: 'App Builder', icon: <Pencil size={18} /> },
  ];

  const nav = isAgency ? agencyNav : merchantNav;
  const currentWorkspaceName = isAgency ? 'FidèleSoin' : (currentMerchant?.name || 'Selected Merchant');

  const filteredMerchants = (merchants || []).filter((m) =>
    m.name.toLowerCase().includes(searchAccount.toLowerCase())
  );

  return (
    <aside
      className={`flex flex-col bg-white border-r border-slate-200/80 shadow-sm shadow-slate-200/40 h-screen sticky top-0 transition-all duration-300 z-30 ${
        isCollapsed ? 'w-[74px]' : 'w-[270px]'
      } flex-shrink-0`}
    >
      {/* Brand Title matching enlarged requirements */}
      <div className="px-6 pt-7 pb-2.5 flex items-center justify-between">
        {!isCollapsed ? (
          <span className="text-2xl font-black text-slate-900 tracking-tight">Nexcore</span>
        ) : (
          <span className="text-2xl font-black text-slate-900 tracking-tight mx-auto">N</span>
        )}
      </div>

      {/* Collapse Trigger button */}
      <button
        onClick={toggleCollapsed}
        className="flex items-center gap-3 px-6 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <AlignJustify size={16} />
        {!isCollapsed && <span className="font-medium tracking-wide">Collapse</span>}
      </button>

      {/* Clinic / Sub-account picker button */}
      {!isCollapsed && (
        <div className="mx-4 mt-3 mb-3 relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/70 transition-all text-sm text-slate-800 shadow-sm shadow-slate-200/50 hover:shadow focus:ring-2 focus:ring-pink-500/20"
          >
            <span className="truncate pr-2 font-bold">{currentWorkspaceName}</span>
            <div className="flex flex-col text-slate-400">
              <ChevronUp size={12} />
              <ChevronDown size={12} />
            </div>
          </button>

          {workspaceOpen && (
            <div className="absolute left-0 top-14 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-300/30 p-3.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3.5 py-2.5 bg-slate-50 mb-3 shadow-xs">
                <Search size={15} className="text-slate-400" />
                <input
                  value={searchAccount}
                  onChange={(e) => setSearchAccount(e.target.value)}
                  placeholder="Search for a sub-account..."
                  className="text-xs font-medium bg-transparent focus:outline-none w-full placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  onSwitchToAgency();
                  navigate('agency');
                  setWorkspaceOpen(false);
                }}
                className="w-full flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-pink-600 py-2 px-2.5 rounded-lg hover:bg-pink-50/60 transition-colors mb-3 border-b border-slate-100 pb-2.5"
              >
                <ArrowLeft size={14} />
                <span>Switch to Agency View</span>
              </button>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-2">
                All accounts
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {filteredMerchants.map((m) => {
                  const isCurrent = !isAgency && m.id === currentMerchant?.id;
                  const clientCount = m.clientsCount !== undefined ? m.clientsCount : m.clients || 0;
                  const color = m.brandColor || m.color || '#EC4899';
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectMerchant(m);
                        navigate('merchant');
                        setWorkspaceOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left group ${
                        isCurrent
                          ? 'bg-pink-50/80 border border-pink-200 shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-xs"
                        style={{ backgroundColor: color }}
                      >
                        {m.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-pink-900 font-bold' : 'text-slate-800'}`}>
                          {m.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {clientCount} {clientCount === 1 ? 'client' : 'clients'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-4 mt-2 space-y-1.5 overflow-y-auto">
        {nav.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-150 group ${
                isActive
                  ? 'bg-pink-50 text-pink-600 border border-pink-200/90 shadow-sm shadow-pink-200/60'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:shadow-xs'
              }`}
            >
              <span className={isActive ? 'text-pink-500' : 'text-slate-400 group-hover:text-slate-700'}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="flex-1 text-left tracking-tight">{item.label}</span>}
              {!isCollapsed && isActive && (
                <ChevronRight size={15} className="text-pink-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Need Support Card */}
      {!isCollapsed && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-pink-50/70 border border-pink-100 shadow-sm shadow-pink-100">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 text-white shadow-sm shadow-pink-500/40">
              <HelpCircle size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Need Support?</p>
              <p className="text-[11px] font-medium text-slate-500 leading-snug mt-0.5">
                Configure your support link in White Label settings.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('whitelabel')}
            className="text-xs text-pink-600 font-bold flex items-center gap-1 hover:text-pink-700 transition-colors ml-10"
          >
            Set up support <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Sign Out Button */}
      <button
        onClick={() => {
          onSwitchToAgency();
          navigate('agency');
        }}
        className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-slate-500 hover:text-slate-900 border-t border-slate-100 transition-colors"
      >
        <LogOut size={16} />
        {!isCollapsed && <span>Sign out</span>}
      </button>
    </aside>
  );
}
export { Sidebar };
