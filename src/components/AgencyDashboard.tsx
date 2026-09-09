import React, { useState } from 'react';
import {
  Store,
  Users,
  TrendingUp,
  Clock,
  Search,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List,
  Languages,
  Trash2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Merchant } from '../types';
import { AddMerchantModal } from './AddMerchantModal';
import { MerchantLanguageModal } from './MerchantLanguageModal';
import { DeleteMerchantModal } from './DeleteMerchantModal';

interface AgencyDashboardProps {
  merchants: Merchant[];
  onSelectMerchant: (merchant: Merchant) => void;
  onAddMerchant: (merchant: Partial<Merchant>) => void;
  onToggleStatus: (merchantId: string) => void;
  onDeleteMerchant: (merchantId: string) => void;
  onUpdateLanguage: (merchantId: string, language: string, useDefault?: boolean) => void;
}

export const AgencyDashboard: React.FC<AgencyDashboardProps> = ({
  merchants,
  onSelectMerchant,
  onAddMerchant,
  onToggleStatus,
  onDeleteMerchant,
  onUpdateLanguage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'clients'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [languageModalMerchant, setLanguageModalMerchant] = useState<Merchant | null>(null);
  const [deleteMerchantTarget, setDeleteMerchantTarget] = useState<Merchant | null>(null);

  const getClientCount = (m: Merchant) => (m.clientsCount !== undefined ? m.clientsCount : m.clients || 0);
  const isInfoRequired = (m: Merchant) => m.status === 'info-required';
  const isActive = (m: Merchant) => m.active !== false && m.status !== 'inactive';

  // Realistic logos styling matching Image 1
  const renderLogo = (m: Merchant) => {
    const nameLower = m.name.toLowerCase();
    if (nameLower.includes('abela')) {
      return (
        <div className="w-10 h-10 rounded-full border border-rose-100 bg-rose-50 flex flex-col items-center justify-center p-1 flex-shrink-0">
          <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-rose-700 rotate-45 mb-0.5" />
          <span className="text-[8px] font-serif font-bold text-rose-800 tracking-tighter leading-none">ABELA</span>
        </div>
      );
    }
    if (nameLower.includes('avogadro')) {
      return (
        <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center flex-shrink-0 shadow-2xs">
          <span className="text-[10px] font-serif font-bold text-slate-800 tracking-wider">AV</span>
        </div>
      );
    }
    if (nameLower.includes('beauty2go')) {
      return (
        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
          <span className="text-[9px] font-serif italic text-slate-900 leading-none">beauty</span>
          <span className="text-[11px] font-bold text-rose-600 leading-none">2Go</span>
        </div>
      );
    }
    if (nameLower.includes('eva')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex flex-col items-center justify-center flex-shrink-0 p-1">
          <span className="text-[9px] font-bold text-teal-800 leading-none">EVA</span>
          <span className="text-[7px] text-teal-600 leading-none">CLINIC</span>
        </div>
      );
    }
    if (nameLower.includes('evolvmd')) {
      return (
        <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-serif italic font-bold text-orange-800">olvM</span>
        </div>
      );
    }
    if (nameLower.includes('good skin')) {
      return (
        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-serif text-sm font-bold flex-shrink-0">
          dS
        </div>
      );
    }
    if (nameLower.includes('hairless')) {
      return (
        <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-[9px] font-bold text-sky-700 flex-shrink-0">
          airles:
        </div>
      );
    }
    if (nameLower.includes('harley')) {
      return (
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-serif font-bold text-slate-800 text-xs flex-shrink-0">
          RL
        </div>
      );
    }
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-xs flex-shrink-0"
        style={{ backgroundColor: m.brandColor || m.color || '#EC4899' }}
      >
        {m.initials}
      </div>
    );
  };

  const filteredMerchants = (merchants || [])
    .filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'desc') return b.name.localeCompare(a.name);
      if (sortOrder === 'clients') return getClientCount(b) - getClientCount(a);
      return 0;
    });

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Top Greeting Bar matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, Wissem! <span className="">👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here's what's happening with your agency today.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-bold shadow-md shadow-pink-500/25 transition-all hover:shadow-lg hover:shadow-pink-500/30 active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Add Merchant</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Merchants */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-slate-900">24</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Merchants</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
            <Store size={18} />
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-slate-900">86</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Active Clients</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <Users size={18} />
          </div>
        </div>

        {/* Verified */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-slate-900">0</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Verified</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-slate-900">0</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Pending</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Your Merchants Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Merchants</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Manage your merchant portfolio</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative w-64">
              <Search size={15} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search merchants..."
                className="w-full pl-9 pr-14 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 border border-slate-200 rounded px-1 py-0.5 bg-white font-mono">
                Ctrl+K
              </span>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-xs font-medium text-slate-700 shadow-xs">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent border-none text-xs text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="asc">Name A-Z</option>
                <option value="desc">Name Z-A</option>
                <option value="clients">Most Clients</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shadow-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  }`}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  }`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Directory List View */}
        {viewMode === 'list' ? (
          <div className="divide-y divide-slate-100">
            {filteredMerchants.map((merchant) => {
              const clientCount = getClientCount(merchant);
              const infoReq = isInfoRequired(merchant);
              const merchantActive = isActive(merchant);
              return (
                <div
                  key={merchant.id}
                  onClick={() => onSelectMerchant(merchant)}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors cursor-pointer group"
                >
                  {/* Merchant Brand & Name */}
                  <div className="flex items-center space-x-4">
                    {renderLogo(merchant)}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                        {merchant.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-500">
                        {clientCount} {clientCount === 1 ? 'client' : 'clients'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-center space-x-5" onClick={(e) => e.stopPropagation()}>
                    {/* Verification Status Pill */}
                    {infoReq ? (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full border border-amber-300 text-amber-600 bg-amber-50/30 text-xs font-semibold">
                        <AlertCircle size={13} />
                        <span>Info Required</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full border border-slate-300 text-slate-600 bg-white text-xs font-semibold">
                        <ShieldCheck size={13} />
                        <span>To Verify</span>
                      </div>
                    )}

                    {/* Active/Inactive toggle switch */}
                    <div className="flex items-center gap-2.5">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={merchantActive}
                          onChange={() => onToggleStatus(merchant.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500/30 peer-focus:ring-offset-1 peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-pink-500 peer-checked:shadow-sm peer-checked:shadow-pink-500/30 transition-colors"></div>
                      </label>
                      <span className={`text-xs font-bold ${merchantActive ? 'text-pink-600' : 'text-slate-400'}`}>
                        {merchantActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Language Modal Trigger */}
                    <button
                      onClick={() => setLanguageModalMerchant(merchant)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Set Language"
                    >
                      <Languages size={16} />
                    </button>

                    {/* Delete Action */}
                    <button
                      onClick={() => setDeleteMerchantTarget(merchant)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Merchant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMerchants.map((merchant) => {
              const merchantActive = isActive(merchant);
              return (
                <div
                  key={merchant.id}
                  onClick={() => onSelectMerchant(merchant)}
                  className="p-5 rounded-xl border border-slate-200/90 hover:border-pink-300 hover:shadow-md hover:shadow-slate-200/60 transition-all cursor-pointer bg-white group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      {renderLogo(merchant)}
                      <div className="px-2.5 py-0.5 rounded-full border border-slate-300 text-slate-600 text-[11px] font-semibold">
                        To Verify
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                      {merchant.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{getClientCount(merchant)} clients</p>
                  </div>

                  <div
                    className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2.5">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={merchantActive}
                          onChange={() => onToggleStatus(merchant.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500/30 peer-focus:ring-offset-1 peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-pink-500 peer-checked:shadow-sm peer-checked:shadow-pink-500/30 transition-colors"></div>
                      </label>
                      <span className={`text-xs font-bold ${merchantActive ? 'text-pink-600' : 'text-slate-400'}`}>
                        {merchantActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setLanguageModalMerchant(merchant)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Set Language"
                      >
                        <Languages size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteMerchantTarget(merchant)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Merchant"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddMerchantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMerchant={onAddMerchant}
      />
      <MerchantLanguageModal
        isOpen={!!languageModalMerchant}
        merchant={languageModalMerchant}
        onClose={() => setLanguageModalMerchant(null)}
        onSave={(merchantId, language) => onUpdateLanguage(merchantId, language)}
      />
      <DeleteMerchantModal
        isOpen={!!deleteMerchantTarget}
        merchant={deleteMerchantTarget}
        onClose={() => setDeleteMerchantTarget(null)}
        onConfirmDelete={(merchantId) => {
          onDeleteMerchant(merchantId);
          setDeleteMerchantTarget(null);
        }}
      />
    </div>
  );
};
