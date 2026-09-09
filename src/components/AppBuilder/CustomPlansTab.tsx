import React, { useState } from 'react';
import { Search, ChevronDown, Check, Plus, Loader2 } from 'lucide-react';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { useCustomPlans } from '../../hooks/useSupabaseData';

const PLAN_FILTERS = ['All', 'Available', 'Purchased', 'Removed'] as const;

interface CustomPlansTabProps {
  clinicId?: string;
}

export default function CustomPlansTab({ clinicId }: CustomPlansTabProps) {
  const { plans, loading, addPlan } = useCustomPlans(clinicId);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | 'Available' | 'Purchased' | 'Removed'>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const [planName, setPlanName] = useState('');
  const [clientName, setClientName] = useState('');
  const [price, setPrice] = useState(150);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;
    try {
      setIsSubmitting(true);
      await addPlan({
        name: planName.trim(),
        clientName: clientName.trim() || 'Walk-in Client',
        price,
        treatmentsCount: 3,
      });
      setPlanName('');
      setClientName('');
      setOpenDrawer(false);
    } catch (err) {
      console.error('Failed to create custom plan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = planFilter === 'All' || p.status === planFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Custom Plans</h2>
          {loading && <Loader2 size={16} className="animate-spin text-pink-500" />}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2 bg-white shadow-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="text-sm bg-transparent focus:outline-none w-40 placeholder:text-slate-400"
            />
            <Search size={16} className="text-slate-700" />
          </div>

          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 shadow-xs min-w-[120px]"
            >
              <span>{planFilter}</span>
              <ChevronDown size={15} className={`text-slate-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-12 z-20 w-36 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                {PLAN_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setPlanFilter(f);
                      setFilterOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition-colors ${
                      planFilter === f ? 'bg-pink-50 text-pink-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {planFilter === f ? <Check size={14} /> : <span className="w-[14px]" />}
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setOpenDrawer(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md cursor-pointer"
          >
            <Plus size={16} />
            <span>Create custom plan</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs min-h-[65vh] flex flex-col justify-center items-center p-8">
        {filteredPlans.length === 0 ? (
          <EmptyState
            title="No custom plans available"
            description="Create personalized treatment plans with custom bundled pricing for individual clients."
            action={{
              label: '+ Create custom plan',
              onClick: () => setOpenDrawer(true),
            }}
          />
        ) : (
          <div className="w-full divide-y divide-slate-100">
            {filteredPlans.map((p) => (
              <div key={p.id} className="py-4 flex items-center justify-between hover:bg-slate-50/50 px-4 rounded-xl transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-400">Target client: {p.clientName} • {p.treatmentsCount} treatments • Created {p.createdAt}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-900">${p.price}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE CUSTOM PLAN DRAWER */}
      <SlideOverDrawer
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title="Create custom plan"
        maxWidth="max-w-[460px]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenDrawer(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreatePlan}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create plan'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Plan name</label>
            <input
              type="text"
              required
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Skin Rejuvenation Bundle"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Target client name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Bundled price ($)</label>
            <input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        </form>
      </SlideOverDrawer>
    </div>
  );
}
