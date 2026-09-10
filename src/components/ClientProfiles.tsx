import { useState } from 'react';
import { Search, ChevronDown, Check, Mail, Phone, Calendar, Sparkles, CreditCard, Clock, Loader2 } from 'lucide-react';
import EmptyState from './EmptyState';
import SlideOverDrawer from './common/SlideOverDrawer';
import { ClientProfile } from '../types';
import { useClientProfiles, handleImageError } from '../hooks/useSupabaseData';

interface ClientProfilesProps {
  clinicId?: string;
}

export default function ClientProfiles({ clinicId }: ClientProfilesProps) {
  const { clients, loading } = useClientProfiles(clinicId);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<'Alphabetical' | 'Most Recent'>('Most Recent');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  const filteredClients = clients
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    )
    .sort((a, b) => {
      if (sortOption === 'Alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return (b.visits || 0) - (a.visits || 0);
    });

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Profiles</h1>
          {loading && <Loader2 size={16} className="animate-spin text-pink-500" />}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2 bg-white shadow-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="text-sm bg-transparent focus:outline-none w-44 placeholder:text-slate-400"
            />
            <Search size={16} className="text-slate-700" />
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 shadow-xs min-w-[130px]"
            >
              <span>{sortOption}</span>
              <ChevronDown size={15} className={`text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-12 z-20 w-44 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                {(['Alphabetical', 'Most Recent'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortOption(opt);
                      setSortOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition-colors ${
                      sortOption === opt ? 'bg-pink-50 text-pink-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {sortOption === opt ? <Check size={14} /> : <span className="w-[14px]" />}
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs h-full min-h-[70vh] flex flex-col overflow-hidden">
          {filteredClients.length === 0 && !loading ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                title="Huh, No clients yet"
                description="When patients book appointments, purchase products, or register in your mobile app, they will automatically appear here."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-6 py-3.5 text-xs font-semibold text-slate-400 bg-slate-50/60 uppercase tracking-wider">
                <span>Client</span>
                <span>Contact</span>
                <span>Total Spend</span>
                <span>Visits</span>
                <span>Status</span>
              </div>

              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-6 py-4 items-center hover:bg-pink-50/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-600 flex-shrink-0 text-sm border border-slate-200">
                      {client.avatar ? (
                        <img src={client.avatar} alt={client.name} onError={handleImageError} className="w-full h-full object-cover" />
                      ) : (
                        client.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> Last visit: {client.lastVisit}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail size={12} className="text-slate-400" />
                      {client.email}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Phone size={12} className="text-slate-400" />
                      {client.phone}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-bold text-slate-900">
                      ${client.totalSpend.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      <Calendar size={12} /> {client.visits} appointments
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        client.status === 'vip'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CLIENT DETAIL SLIDE-OVER DRAWER */}
      {selectedClient && (
        <SlideOverDrawer
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          title="Patient Clinical Profile"
          maxWidth="max-w-[500px]"
          footer={
            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold shadow-sm transition-all"
            >
              Done
            </button>
          }
        >
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-lg text-slate-700 border-2 border-white shadow-sm flex-shrink-0">
                {selectedClient.avatar ? (
                  <img src={selectedClient.avatar} alt={selectedClient.name} onError={handleImageError} className="w-full h-full object-cover" />
                ) : (
                  selectedClient.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedClient.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedClient.status === 'vip'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedClient.status}
                  </span>
                </div>
                <p className="text-slate-500 mt-0.5 truncate">{selectedClient.email}</p>
                <p className="text-slate-400 mt-0.5">{selectedClient.phone}</p>
              </div>
            </div>

            {/* Financial & Loyalty Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <CreditCard size={13} className="text-slate-400" /> Total Spend
                </p>
                <p className="text-lg font-black text-slate-900 mt-1">
                  ${selectedClient.totalSpend.toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" /> Clinical Visits
                </p>
                <p className="text-lg font-black text-slate-900 mt-1">
                  {selectedClient.visits}
                </p>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-pink-500" /> Beauty Bank
                </p>
                <p className="text-lg font-black text-pink-600 mt-1">
                  ${((selectedClient as any).beautyBankBalance || 150).toFixed(2)}
                </p>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" /> VIP Points
                </p>
                <p className="text-lg font-black text-slate-900 mt-1">
                  {((selectedClient as any).rewardPoints || 850).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Treatment History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Treatment & Order History
              </h4>
              <div className="space-y-2.5">
                {((selectedClient as any).treatmentHistory && (selectedClient as any).treatmentHistory.length > 0 ? (
                  (selectedClient as any).treatmentHistory.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{item.treatment}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.date} • With {item.practitioner}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">${item.amount}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">HydraFacial Deluxe</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">2026-08-28 • With Dr. Sarah Jenkins</p>
                    </div>
                    <span className="font-bold text-slate-900">$160</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideOverDrawer>
      )}
    </div>
  );
}
