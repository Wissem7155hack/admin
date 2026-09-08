import { useState } from 'react';
import { Plus, Check, ChevronDown, ChevronUp, UserPlus, Users, MessageSquare, MapPin, ShoppingBag } from 'lucide-react';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { RewardPointsConfig } from '../../types';

export default function RewardsTab() {
  const [config, setConfig] = useState<RewardPointsConfig>({
    signUpReward: 50,
    referralReward: 200,
    googleReviewReward: 80,
    checkInReward: 60,
    purchaseRewardPerDollar: 1,
  });
  const [memberAccordionOpen, setMemberAccordionOpen] = useState(false);
  const [openRewardDrawer, setOpenRewardDrawer] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [pointsCost, setPointsCost] = useState(100);

  const updateField = (key: keyof RewardPointsConfig, val: number) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Rewards</h2>
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
                onChange={(e) => updateField('signUpReward', Number(e.target.value))}
                className="w-full"
              />
            </div>

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
                onChange={(e) => updateField('referralReward', Number(e.target.value))}
                className="w-full"
              />
            </div>

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
                onChange={(e) => updateField('googleReviewReward', Number(e.target.value))}
                className="w-full"
              />
            </div>

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
                onChange={(e) => updateField('checkInReward', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShoppingBag size={15} className="text-slate-500" />
                  <span>Purchase reward per $ spent</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-12 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                    {config.purchaseRewardPerDollar}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">points</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={config.purchaseRewardPerDollar}
                onChange={(e) => updateField('purchaseRewardPerDollar', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={() => setMemberAccordionOpen(!memberAccordionOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 py-1"
            >
              <span>Member-only configurations</span>
              {memberAccordionOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {memberAccordionOpen && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-2 animate-in fade-in">
                <p>• VIP members receive 2x points multiplier on all in-clinic checkout items.</p>
                <p>• Birthday point bonuses trigger automatically 7 days before event.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    
      <SlideOverDrawer
        isOpen={openRewardDrawer}
        onClose={() => setOpenRewardDrawer(false)}
        title="Create a new reward"
        maxWidth="max-w-[480px]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenRewardDrawer(false)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                alert('Reward created!');
                setOpenRewardDrawer(false);
              }}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
            >
              Create Reward
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Reward title</label>
            <input
              type="text"
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              placeholder="e.g. Free HydroFacial or $25 Off"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Points required</label>
            <input
              type="number"
              min={1}
              value={pointsCost}
              onChange={(e) => setPointsCost(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        </div>
      </SlideOverDrawer>
    </div>
  );
}
