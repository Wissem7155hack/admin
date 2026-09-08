import React, { useState } from 'react';
import { Banknote, ShoppingCart, Gift, Tag, Info, ChevronDown, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import EmptyState from './EmptyState';

const CHART_DATA = [
  { date: 'Fri, Aug 28', value: 0 },
  { date: 'Sat, Aug 29', value: 0 },
  { date: 'Sun, Aug 30', value: 0 },
  { date: 'Mon, Aug 31', value: 0 },
  { date: 'Tue, Sep 1', value: 0 },
  { date: 'Wed, Sep 2', value: 0 },
  { date: 'Thu, Sep 3', value: 0 },
];

export default function ShopSummary() {
  const [granularity, setGranularity] = useState<'Daily' | 'Monthly' | 'Yearly'>('Daily');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shop Summary</h1>
        <button
          onClick={() => setShowDemo(!showDemo)}
          className="text-xs px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:text-slate-900 shadow-xs font-semibold"
        >
          {showDemo ? 'Show Default (Zero State)' : 'Preview with Activity'}
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-black text-slate-900">{showDemo ? '$4,850' : '$0'}</span>
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
              <Banknote size={18} />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Total Sales since starting</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-black text-slate-900">{showDemo ? '$185' : '$0'}</span>
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
            <span className="text-3xl font-black text-slate-900">{showDemo ? '24' : '0'}</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Gift size={18} />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Rewards unlocked</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-black text-slate-900">{showDemo ? '$340' : '$0'}</span>
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

      {/* Prominent Scaled-Up 'Sales over time' Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sales over time</h3>
            <p className="text-xs text-slate-400">Revenue generated from products, packages, and treatments.</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 bg-white shadow-2xs"
            >
              <span>{granularity}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-10 z-20 w-32 rounded-xl border border-slate-200 bg-white shadow-xl py-1 text-xs animate-in fade-in">
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
                    {granularity === g && <Check size={12} className="text-pink-600 font-bold" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={showDemo ? [
                { date: 'Fri, Aug 28', value: 350 },
                { date: 'Sat, Aug 29', value: 890 },
                { date: 'Sun, Aug 30', value: 420 },
                { date: 'Mon, Aug 31', value: 1200 },
                { date: 'Tue, Sep 1', value: 750 },
                { date: 'Wed, Sep 2', value: 920 },
                { date: 'Thu, Sep 3', value: 1450 },
              ] : CHART_DATA}
              margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tickFormatter={(v) => '$' + v} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                formatter={(val) => ['$' + val, 'Sales']}
              />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Empty State Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-8 flex items-center justify-center">
        <EmptyState
          title="No transactions available"
          description="Online shop orders, package purchases, and redeemed treatments will appear here in real time."
        />
      </div>
    </div>
  );
}
export { ShopSummary };
