import { useState, useRef, useEffect } from 'react';
import {
  Home,
  Users,
  Store,
  Crown,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LogOut,
  HelpCircle,
  ArrowRight,
  Search,
  ArrowLeft,
  AlignJustify,
  ShieldCheck,
} from 'lucide-react';
import { View, Merchant } from '../types';

interface SidebarProps {
  view: View;
  currentView?: View;
  setView: (view: View) => void;
  onNavigate?: (view: View) => void;
  isAgency: boolean;
  merchants: Merchant[];
  currentMerchant?: Merchant;
  onSelectMerchant: (merchant: Merchant) => void;
  onSwitchToAgency: () => void;
  onSignOut: () => void;
}

export default function Sidebar({
  view,
  currentView,
  setView,
  onNavigate,
  isAgency,
  merchants,
  currentMerchant,
  onSelectMerchant,
  onSwitchToAgency,
  onSignOut,
}: SidebarProps) {
  const activeView = currentView || view;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [searchAccount, setSearchAccount] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

  const navigate = (v: View) => {
    if (onNavigate) onNavigate(v);
    else setView(v);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setWorkspaceOpen(false);
      }
    }
    if (workspaceOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [workspaceOpen]);

  const agencyNav: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'agency', label: 'My Apps', icon: <Store size={18} /> },
    { id: 'whitelabel', label: 'White Label', icon: <Sliders size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Sliders size={18} /> },
  ];

  const merchantNav: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'merchant', label: 'Home', icon: <Home size={18} /> },
    { id: 'clients', label: 'Client Profiles', icon: <Users size={18} /> },
    { id: 'shop', label: 'Shop Summary', icon: <Store size={18} /> },
    { id: 'memberships', label: 'Memberships', icon: <Crown size={18} /> },
    { id: 'appbuilder', label: 'App Builder', icon: <Sparkles size={18} /> },
  ];

  const nav = isAgency ? agencyNav : merchantNav;
  const currentWorkspaceName = isAgency ? 'FidèleSoin' : (currentMerchant?.name || 'The Laser Club UK');

  const filteredMerchants = (merchants || []).filter((m) =>
    m.name.toLowerCase().includes(searchAccount.toLowerCase())
  );

  return (
    <aside
      className={`flex flex-col bg-[#0B0D13] border-r border-white/10 shadow-xl h-screen sticky top-0 transition-all duration-300 z-30 ${
        isCollapsed ? 'w-[74px]' : 'w-[270px]'
      } flex-shrink-0 text-white`}
    >
      {/* Brand Title: Nexcore in white */}
      <div className="px-6 pt-7 pb-2.5 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <img
              src="/images/clinic's logo .png"
              alt={currentWorkspaceName}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
              className="h-8 max-w-[170px] object-contain rounded"
            />
            <span style={{ display: 'none' }} className="text-2xl font-black text-white tracking-tight">
              Nexcore
            </span>
          </div>
        ) : (
          <img
            src="/images/clinic's logo .png"
            alt="Logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
            className="w-8 h-8 object-contain rounded mx-auto"
          />
        )}
      </div>

      {/* Collapse Trigger button */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex items-center gap-3 px-6 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
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
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm text-white shadow-sm focus:ring-2 focus:ring-pink-500/30 cursor-pointer"
          >
            <span className="truncate pr-2 font-bold text-slate-100">{currentWorkspaceName}</span>
            <div className="flex flex-col text-slate-400">
              <ChevronUp size={12} />
              <ChevronDown size={12} />
            </div>
          </button>

          {workspaceOpen && (
            <div className="absolute left-0 top-14 z-50 w-80 rounded-xl border border-white/15 bg-[#141822] shadow-2xl p-3.5 animate-in fade-in zoom-in-95 duration-150 text-white">
              <div className="flex items-center gap-2 border border-white/10 rounded-lg px-3.5 py-2.5 bg-white/5 mb-3">
                <Search size={15} className="text-slate-400" />
                <input
                  value={searchAccount}
                  onChange={(e) => setSearchAccount(e.target.value)}
                  placeholder="Search for a sub-account..."
                  className="text-xs font-medium bg-transparent focus:outline-none w-full placeholder:text-slate-400 text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  onSwitchToAgency();
                  navigate('agency');
                  setWorkspaceOpen(false);
                }}
                className="w-full flex items-center gap-2.5 text-xs font-bold text-slate-300 hover:text-pink-400 py-2 px-2.5 rounded-lg hover:bg-white/5 transition-colors mb-3 border-b border-white/10 pb-2.5 cursor-pointer"
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
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left cursor-pointer ${
                        isCurrent
                          ? 'bg-pink-500/20 border border-pink-500/40'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-xs"
                        style={{ backgroundColor: color }}
                      >
                        {m.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-pink-300 font-bold' : 'text-slate-100'}`}>
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

      {/* Navigation Items in White/Nearly White */}
      <nav className="flex-1 px-4 mt-2 space-y-1.5 overflow-y-auto">
        {nav.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer group ${
                isActive
                  ? 'bg-pink-500/15 text-pink-400 border border-pink-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-pink-400' : 'text-slate-400 group-hover:text-white transition-colors'}>
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
        <div className="mx-4 mb-4 p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 text-white shadow-sm shadow-pink-500/40">
              <HelpCircle size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Need Support?</p>
              <p className="text-[11px] font-medium text-slate-400 leading-snug mt-0.5">
                Configure your support link in White Label settings.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('whitelabel')}
            className="text-xs text-pink-400 font-bold flex items-center gap-1 hover:text-pink-300 transition-colors ml-10 cursor-pointer"
          >
            Set up support <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Privacy & Cookie Settings Link */}
      <button
        type="button"
        onClick={() => navigate('user_settings')}
        className="flex items-center gap-3 px-6 py-2.5 text-xs font-semibold text-slate-400 hover:text-white border-t border-white/10 transition-colors cursor-pointer"
      >
        <ShieldCheck size={16} className="text-pink-400" />
        {!isCollapsed && <span>Privacy & Cookies</span>}
      </button>

      {/* Sign Out Button */}
      <button
        type="button"
        onClick={onSignOut}
        className="flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-slate-400 hover:text-white border-t border-white/10 transition-colors cursor-pointer"
      >
        <LogOut size={16} />
        {!isCollapsed && <span>Sign out</span>}
      </button>
    </aside>
  );
}

export { Sidebar };
