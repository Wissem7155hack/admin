import React, { useState } from 'react';
import {
  Info,
  ArrowDownToLine,
  Eye,
  Plus,
  Edit2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Merchant } from '../types';
import { useTransactions, useTeamMembers } from '../hooks/useSupabaseData';

interface MerchantDashboardProps {
  currentMerchant: Merchant;
}

const processingData = [
  { time: '12:00 AM', amount: 0 },
  { time: '3:00 AM', amount: 0 },
  { time: '6:00 AM', amount: 0 },
  { time: '9:00 AM', amount: 0 },
  { time: '12:00 PM', amount: 0 },
  { time: '3:00 PM', amount: 0 },
  { time: '6:00 PM', amount: 0 },
  { time: '9:00 PM', amount: 0 },
];

const mrrData = [
  { date: 'Sep 1', mrr: 0 },
  { date: 'Sep 3', mrr: 0 },
  { date: 'Sep 5', mrr: 0 },
  { date: 'Sep 7', mrr: 0 },
];

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ currentMerchant }) => {
  const { transactions, totalRevenue, mrr } = useTransactions(currentMerchant?.id);
  const { teamMembers } = useTeamMembers(currentMerchant?.id);
  const [teamSort, setTeamSort] = useState<'Sales' | 'MRR'>('Sales');

  const liveProcessing = transactions.length > 0
    ? transactions.map((t) => ({
        time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: Number(t.amount || 0),
      })).slice(0, 8).reverse()
    : processingData;

  const symbol = currentMerchant?.currency?.includes('$') ? '$' : '£';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Hero: Daily processing & Live Activity Feed matching Image 2 & 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Processing Card */}
        <div className="lg:col-span-2 bg-white p-7 rounded-xl border border-slate-200/80 shadow-md shadow-slate-200/60 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span>Daily processing</span>
              <Info size={14} className="text-slate-400 cursor-help" />
            </div>

            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{symbol}{totalRevenue.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-medium">
                Today: {symbol}{Math.round(totalRevenue * 0.4).toLocaleString()} &nbsp; Yesterday: {symbol}{Math.round(totalRevenue * 0.35).toLocaleString()}
              </span>
            </div>

            {/* Area Chart */}
            <div className="h-52 w-full mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveProcessing} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip
                    content={({ active }) => {
                      if (active) {
                        return (
                          <div className="bg-slate-900/90 backdrop-blur-xs text-white p-2.5 rounded-lg text-xs shadow-xl space-y-1">
                            <p className="font-bold text-slate-200">9:00 AM - 12:00 PM</p>
                            <p className="text-emerald-400">Today: {symbol}0</p>
                            <p className="text-slate-400">Yesterday: {symbol}0</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBlue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Activity Feed matching Image 2 & 4 */}
        <div className="bg-white p-7 rounded-xl border border-slate-200/80 shadow-md shadow-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500/50" />
            <h3 className="text-sm font-bold text-slate-900">Live Activity Feed</h3>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <p className="text-xs text-slate-500 font-medium">No recent activities.</p>
          </div>
        </div>
      </div>

      {/* Stats Filter Bar matching Image 2 & 4 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-900 text-sm">Stats</span>

          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold text-slate-700 shadow-xs">
            Last 7 days
          </div>

          <div className="text-slate-500 font-semibold">
            Sep 2 - 8, 2026
          </div>

          <div className="text-slate-500 font-medium">
            Compared to <span className="text-slate-700 font-bold">No comparison</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700 transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5">
            <Plus size={13} />
            <span>Add</span>
          </button>
          <button className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700 transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5">
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Grid of Stat Cards matching Image 2, 4, 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Net Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Net Revenue</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <ArrowDownToLine size={15} className="text-slate-400 hover:text-slate-700 cursor-pointer" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{symbol}{mrr.toLocaleString()}</div>
          <div className="mt-4 p-6 bg-slate-50/60 rounded-lg border border-slate-100 text-center text-xs font-medium text-slate-500">
            No data available
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>MRR</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <ArrowDownToLine size={15} className="text-slate-400 hover:text-slate-700 cursor-pointer" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{symbol}{mrr.toLocaleString()}</div>
          <div className="mt-4 h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mrrData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Line type="monotone" dataKey="mrr" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Sources Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Revenue Sources Breakdown</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <ArrowDownToLine size={15} className="text-slate-400 hover:text-slate-700 cursor-pointer" />
          </div>

          {/* Segmented bar */}
          <div className="w-full h-2 rounded-full overflow-hidden flex my-4 bg-slate-100">
            <div className="w-1/5 bg-emerald-500 h-full" />
            <div className="w-1/5 bg-blue-500 h-full" />
            <div className="w-1/5 bg-pink-500 h-full" />
            <div className="w-1/5 bg-rose-800 h-full" />
            <div className="w-1/5 bg-amber-500 h-full" />
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Memberships</span>
              </div>
              <span className="font-bold text-slate-800">{symbol}0 (0%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Rewards & cash balance</span>
              </div>
              <span className="font-bold text-slate-800">{symbol}0 (0%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span>Notification offers</span>
              </div>
              <span className="font-bold text-slate-800">{symbol}0 (0%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-800" />
                <span>Custom plans</span>
              </div>
              <span className="font-bold text-slate-800">{symbol}0 (0%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Shop</span>
              </div>
              <span className="font-bold text-slate-800">{symbol}0 (0%)</span>
            </div>
          </div>
        </div>

        {/* App User LTV */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>App User LTV</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <ArrowDownToLine size={15} className="text-slate-400 hover:text-slate-700 cursor-pointer" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{symbol}0</div>
          <div className="mt-4 p-6 bg-slate-50/60 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
            No data available
          </div>
        </div>

        {/* Client LTV */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Client LTV</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <ArrowDownToLine size={15} className="text-slate-400 hover:text-slate-700 cursor-pointer" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{symbol}0</div>
          <div className="mt-4 p-6 bg-slate-50/60 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
            No data available
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Top Clients</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900">
              <span>See All</span>
              <Eye size={13} />
            </button>
          </div>
          <div className="mt-4 p-8 bg-slate-50/60 rounded-lg border border-slate-100 text-center text-xs font-medium text-slate-500">
            No client data available
          </div>
        </div>

        {/* Top Team Members */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Top Team Members</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900">
              <span>See All</span>
              <Eye size={13} />
            </button>
          </div>

          <div className="flex items-center justify-between my-2">
            <span className="text-xs font-medium text-slate-500">Sort by:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs shadow-inner">
              <button
                onClick={() => setTeamSort('Sales')}
                className={`px-3 py-0.5 rounded-md font-bold transition-colors ${
                  teamSort === 'Sales' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setTeamSort('MRR')}
                className={`px-3 py-0.5 rounded-md font-bold transition-colors ${
                  teamSort === 'MRR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                MRR
              </button>
            </div>
          </div>

          <div className="mt-3 divide-y divide-slate-100 text-xs max-h-48 overflow-y-auto">
            {teamMembers.length === 0 ? (
              <p className="p-4 text-center text-slate-400">No team member data available</p>
            ) : (
              teamMembers.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-xs">
                      {m.avatarUrl ? <img src={m.avatarUrl} alt={m.firstName} className="w-full h-full object-cover" /> : m.firstName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                      <p className="text-[10px] text-slate-400">{m.jobTitle}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    {symbol}{teamSort === 'Sales' ? (m.sales || 14500).toLocaleString() : (m.mrr || 2600).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* App Users */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>App Users</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <ArrowDownToLine size={15} className="text-slate-400 hover:text-slate-700 cursor-pointer" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">0</div>
          <div className="mt-4 p-6 bg-slate-50/60 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
            No data available
          </div>
        </div>

        {/* Referrals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Referrals</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <ArrowDownToLine size={15} className="text-slate-400 hover:text-slate-700 cursor-pointer" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">0</div>
          <div className="mt-4 p-6 bg-slate-50/60 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
            No data available
          </div>
        </div>

        {/* Visits */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Visits</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <ArrowDownToLine size={15} className="text-slate-400 hover:text-slate-700 cursor-pointer" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">0</div>
          <div className="mt-4 p-6 bg-slate-50/60 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
            No data available
          </div>
        </div>

        {/* Google Reviews */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/60 transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Google Reviews</span>
              <Info size={13} className="text-slate-400 cursor-help" />
            </div>
            <ArrowDownToLine size={15} className="text-slate-400 hover:text-slate-700 cursor-pointer" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">0</div>
          <div className="mt-4 p-6 bg-slate-50/60 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
            No data available
          </div>
        </div>
      </div>
    </div>
  );
};
