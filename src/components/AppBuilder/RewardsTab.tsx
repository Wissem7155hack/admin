import { useState } from 'react';
import { Plus, Check, ChevronDown, ChevronUp, UserPlus, Users, MessageSquare, MapPin, ShoppingBag, Loader2 } from 'lucide-react';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { useLoyaltyProgram } from '../../hooks/useSupabaseData';

interface RewardsTabProps {
  clinicId?: string;
}

export default function RewardsTab({ clinicId }: RewardsTabProps) {
  const { config, isSaving, lastSaved, updateConfigField } = useLoyaltyProgram(clinicId);
  const [memberAccordionOpen, setMemberAccordionOpen] = useState(false);
  const [openRewardDrawer, setOpenRewardDrawer] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [pointsCost, setPointsCost] = useState(100);

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    setOpenRewardDrawer(false);
    setRewardTitle('');
    setPointsCost(100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">Rewards</h2>
          {isSaving ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
              <Loader2 size={11} className="animate-spin" />
              Saving...
            </span>
          ) : lastSaved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Check size={11} />
              Saved to Supabase
            </span>
          ) : null}
        </div>
        <button
          onClick={() => setOpenRewardDrawer(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
        >
          <Plus size={16} />
          <span>Create a new reward</span>
        </button>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-6 items-start">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs min-h-[60vh] flex flex-col justify-center items-center p-8">
          <EmptyState
            title="Create your first reward!"
            description="Incentivize patient loyalty with redeemable free treatments, dollar discounts, or exclusive merchandise."
            action={{
              label: "+ Create a new reward",
              onClick: () => setOpenRewardDrawer(true),
            }}
          />
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Points configurations</span>
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <Check size={13} strokeWidth={3} />
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. Sign-up reward */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <UserPlus size={15} className="text-slate-500" />
                  <span>Sign-up reward</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-12 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                    {config.signUpReward}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">points</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={5}
                value={config.signUpReward}
                onChange={(e) => updateConfigField('signUpReward', Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* 2. Referral reward */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Users size={15} className="text-slate-500" />
                  <span>Referral reward</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-12 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                    {config.referralReward}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">points</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={10}
                value={config.referralReward}
                onChange={(e) => updateConfigField('referralReward', Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* 3. Google Review reward */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MessageSquare size={15} className="text-slate-500" />
                  <span>Google Review reward</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-12 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                    {config.googleReviewReward}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">points</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={5}
                value={config.googleReviewReward}
                onChange={(e) => updateConfigField('googleReviewReward', Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* 4. Check-in reward */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MapPin size={15} className="text-slate-500" />
                  <span>Check-in reward</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-12 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                    {config.checkInReward}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">points</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={5}
                value={config.checkInReward}
                onChange={(e) => updateConfigField('checkInReward', Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* 5. Purchase reward per dollar spent */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShoppingBag size={15} className="text-slate-500" />
                  <span>Purchase reward</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-12 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                    {config.purchaseRewardPerDollar}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">pts / $1</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={config.purchaseRewardPerDollar}
                onChange={(e) => updateConfigField('purchaseRewardPerDollar', Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setMemberAccordionOpen(!memberAccordionOpen)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <span>Member exclusive perks</span>
                {memberAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {memberAccordionOpen && (
                <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-500 space-y-2 animate-in fade-in">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-pink-500 focus:ring-pink-500/20" />
                    <span>Double points multiplier on birthday month</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-pink-500 focus:ring-pink-500/20" />
                    <span>Free shipping & sample treatments for VIP members</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE REWARD DRAWER */}
      <SlideOverDrawer
        isOpen={openRewardDrawer}
        onClose={() => setOpenRewardDrawer(false)}
        title="Create a new reward"
        maxWidth="max-w-[460px]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenRewardDrawer(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateReward}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
            >
              Save reward
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateReward} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Reward Title</label>
            <input
              type="text"
              required
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              placeholder="e.g. Free LED Facial Session"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Points Cost to Redeem</label>
            <input
              type="number"
              min={10}
              value={pointsCost}
              onChange={(e) => setPointsCost(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        </form>
      </SlideOverDrawer>
    </div>
  );
}
