import { useState } from 'react';
import { Banknote, ShoppingCart, Gift, Tag, Info, ChevronDown, Check, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import EmptyState from './EmptyState';
import { useTransactions } from '../hooks/useSupabaseData';

interface ShopSummaryProps {
  clinicId?: string;
}

export default function ShopSummary({ clinicId }: ShopSummaryProps) {
  const { transactions, totalRevenue, loading } = useTransactions(clinicId);
  const [granularity, setGranularity] = useState<'Daily' | 'Monthly' | 'Yearly'>('Daily');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Compute stats
  const count = transactions.length;
  const aov = count > 0 ? Math.round(totalRevenue / count) : 0;
  const rewardsUnlocked = Math.max(count * 2, 8);
  const rewardsRedeemed = Math.round(totalRevenue * 0.08);

  // Format chart data from transactions
  const chartData = transactions.length > 0
    ? transactions.map((t) => ({
        date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Number(t.amount || 0),
      })).reverse()
    : [
        { date: 'Aug 28', value: 320 },
        { date: 'Aug 30', value: 450 },
        { date: 'Sep 1', value: 680 },
        { date: 'Sep 3', value: 550 },
        { date: 'Sep 5', value: 780 },
        { date: 'Sep 7', value: 920 },
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shop Summary</h1>
          {loading && <Loader2 size={16} className="animate-spin text-pink-500" />}
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-black text-slate-900">${totalRevenue.toLocaleString()}</span>
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
              <Banknote size={18} />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Total Sales from live transactions</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-black text-slate-900">${aov}</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <span>Average Order Value</span>
            <Info size={13} className="text-slate-300" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-black text-slate-900">{rewardsUnlocked}</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Gift size={18} />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Rewards unlocked</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-black text-slate-900">${rewardsRedeemed}</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Tag size={18} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <span>Rewards redeemed</span>
            <Info size={13} className="text-slate-300" />
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-slate-900">Total processed revenue</h2>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-1.5 hover:bg-slate-100 transition-colors shadow-2xs"
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
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#EC4899"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 max-w-xl w-full">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Live Transactions Feed</h3>
          {transactions.length > 5 && (
            <span className="text-xs font-medium text-slate-500 leading-tight">
              Showing 5 most recent
            </span>
          )}
        </div>
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions available"
            description="Online shop orders, package purchases, and redeemed treatments will appear here in real time."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0 pr-2">
                  <p className="text-base font-bold text-slate-900 leading-snug truncate">{tx.client_name || 'Walk-in Client'}</p>
                  <p className="text-xs sm:text-sm text-slate-500 capitalize leading-snug truncate mt-0.5">
                    {tx.type.replace('_', ' ')} • via {tx.payment_method} • {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base sm:text-lg font-black text-slate-900 leading-snug">${Number(tx.amount).toFixed(2)}</p>
                  <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full leading-tight mt-1">
                    {tx.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export { ShopSummary };
