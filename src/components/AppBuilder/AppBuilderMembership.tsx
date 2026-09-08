import { useMemo, useState } from 'react';
import { Plus, Sparkles, Users, CalendarDays } from 'lucide-react';
import CreateMembershipSheet from './CreateMembershipSheet';
import { MembershipRecord } from '../../types';

interface Props {
  openComposer: boolean;
  onComposerChange: (open: boolean) => void;
}

const defaultImage = '/images/spa-membership.jpg';

export default function AppBuilderMembership({ openComposer, onComposerChange }: Props) {
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);

  const featuredMembership = useMemo(() => memberships[0], [memberships]);

  function handleCreateMembership(nextMembership: MembershipRecord) {
    setMemberships((prev) => [nextMembership, ...prev]);
    onComposerChange(false);
  }

  return (
    <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-6 h-full">
      {/* Phone preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
        <p className="text-xs text-gray-400 mb-3">Preview</p>
        <div className="relative w-[260px] h-[520px] rounded-[40px] bg-slate-900 shadow-[0_20px_40px_rgba(15,23,42,0.35)] overflow-hidden">
          <div className="absolute top-3 w-24 h-5 rounded-full bg-slate-800" />
          <div className="absolute left-0 top-24 w-1.5 h-20 bg-slate-800 rounded-r-full" />
          <div className="absolute right-0 top-32 w-1.5 h-16 bg-slate-800 rounded-l-full" />
          <div className="absolute inset-3 mt-8 rounded-[28px] bg-white overflow-hidden">
            {featuredMembership ? (
              <div className="h-full flex flex-col">
                <img
                  src={featuredMembership.imageUrl || defaultImage}
                  alt={featuredMembership.name}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{featuredMembership.name}</p>
                    <p className="text-xs text-slate-500">{featuredMembership.description || 'Premium monthly access with curated member perks.'}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1"><Users size={12} /> 0 members</span>
                    <span className="font-semibold text-slate-900">${featuredMembership.price}/mo</span>
                  </div>
                  {featuredMembership.commitmentEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2 py-1 text-[11px]">
                      <CalendarDays size={11} /> {featuredMembership.commitmentMonths} months commitment
                    </span>
                  )}
                  <button className="w-full rounded-xl bg-pink-500 py-2 text-xs font-semibold text-white">Join membership</button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Sparkles size={28} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">No memberships available</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Create a membership to see how it will appear in your app.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty state + call-to-action */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.03),_transparent_55%)]" />
        <div className="relative z-10 flex-1 overflow-auto">
          {memberships.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-500">
                <Sparkles size={32} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Create your first membership!</h2>
              <p className="text-sm text-gray-400 max-w-md mb-5">
                Design recurring plans, configure pricing, and add signup bonuses that automatically reward new members.
              </p>
              <button
                onClick={() => onComposerChange(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm font-semibold shadow-md shadow-pink-200 transition-all hover:shadow-lg"
              >
                <Plus size={16} />
                Create a new membership
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-left">
              {memberships.map((membership) => (
                <div key={membership.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <img src={membership.imageUrl || defaultImage} alt={membership.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{membership.name}</p>
                      <p className="text-xs text-gray-500 truncate">{membership.description || 'No description provided'}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">${membership.price}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {openComposer && (
          <CreateMembershipSheet
            onClose={() => onComposerChange(false)}
            onCreate={handleCreateMembership}
          />
        )}
      </div>
    </div>
  );
}
