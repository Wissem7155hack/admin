import { useState } from 'react';
import { Search, ChevronDown, Check, Mail, Phone } from 'lucide-react';
import EmptyState from './EmptyState';
import { ClientProfile } from '../types';

const INITIAL_CLIENTS: ClientProfile[] = [
  { id: '1', name: 'Sophia Miller', email: 'sophia.m@gmail.com', phone: '+1 (555) 234-8901', totalSpend: 840, visits: 5, lastVisit: 'Yesterday', status: 'vip' },
  { id: '2', name: 'James Wilson', email: 'j.wilson@outlook.com', phone: '+1 (555) 890-1234', totalSpend: 320, visits: 2, lastVisit: '3 days ago', status: 'active' },
  { id: '3', name: 'Amelia Chen', email: 'amelia.chen@icloud.com', phone: '+1 (555) 432-7654', totalSpend: 1450, visits: 9, lastVisit: '1 week ago', status: 'vip' },
  { id: '4', name: 'Olivia Taylor', email: 'olivia.t@gmail.com', phone: '+1 (555) 678-9012', totalSpend: 190, visits: 1, lastVisit: '2 weeks ago', status: 'active' },
];

export default function ClientProfiles() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<'Alphabetical' | 'Most Recent'>('Alphabetical');
  const [sortOpen, setSortOpen] = useState(false);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      <div className="px-8 py-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Profiles</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2 bg-white shadow-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
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

          <button
            onClick={() => setClients(clients.length > 0 ? [] : INITIAL_CLIENTS)}
            className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-xs font-medium"
          >
            {clients.length > 0 ? 'Show Empty State' : 'Load Demo Clients'}
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs h-full min-h-[70vh] flex flex-col overflow-hidden">
          {clients.length === 0 ? (
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
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-6 py-4 items-center hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm">
                      {client.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-400">Last visit: {client.lastVisit}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {client.email}</p>
                    <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {client.phone}</p>
                  </div>

                  <div className="text-sm font-bold text-slate-900">
                    ${client.totalSpend.toLocaleString()}
                  </div>

                  <div className="text-sm text-slate-600">
                    {client.visits} {client.visits === 1 ? 'visit' : 'visits'}
                  </div>

                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      client.status === 'vip'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {client.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
