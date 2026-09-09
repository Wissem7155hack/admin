import { useState } from 'react';
import { RefreshCw, Users, Info, ChevronDown, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import EmptyState from './EmptyState';

const membershipSignUpsData = [
  { date: 'Aug 28', count: 0 },
  { date: 'Aug 29', count: 0 },
  { date: 'Aug 30', count: 0 },
  { date: 'Aug 31', count: 0 },
  { date: 'Sep 01', count: 0 },
  { date: 'Sep 02', count: 0 },
  { date: 'Sep 03', count: 0 },
];

export default function MembershipsOverview() {
  const [granularity, setGranularity] = useState<'Daily' | 'Monthly' | 'Yearly'>('Daily');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Memberships</h1>

      {/* Scaled-up Grid matching visual weight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 2 KPI Cards (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-black text-slate-900">$0</span>
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 shadow-2xs">
                <RefreshCw size={18} />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">Monthly Recurring Revenue</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-black text-slate-900">0</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-2xs">
                <Users size={18} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <span>Total active Members</span>
              <Info size={13} className="text-slate-300" />
            </div>
          </div>
        </div>

        {/* Scaled-Up Chart Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Membership Sign Ups over time</h3>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <span>{granularity}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-10 z-20 w-32 bg-white rounded-xl border border-slate-200 shadow-xl py-1 text-xs animate-in fade-in">
                  {(['Daily', 'Monthly', 'Yearly'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGranularity(g);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-slate-700"
                    >
                      <span>{g}</span>
                      {granularity === g && <Check size={12} className="text-pink-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={membershipSignUpsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMemberships" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 5]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#EC4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMemberships)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Credit Card Dunning Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-6">Credit Card Dunning</h3>
        <div className="py-12">
          <EmptyState
            title="No dunning transactions available"
            description="Failed rebills and retried payment alerts will appear here."
          />
        </div>
      </div>
    </div>
  );
}
export { MembershipsOverview };
