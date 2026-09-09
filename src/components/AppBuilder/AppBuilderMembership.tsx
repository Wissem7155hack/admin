import { useMemo } from 'react';
import EmptyState from '../EmptyState';
import { Sparkles, Users, CalendarDays } from 'lucide-react';
import CreateMembershipSheet from './CreateMembershipSheet';
import { MembershipRecord } from '../../types';
import { useMemberships } from '../../hooks/useSupabaseData';

interface Props {
  clinicId?: string;
  openComposer: boolean;
  onComposerChange: (open: boolean) => void;
}

const defaultImage = '/images/spa-membership.jpg';

export default function AppBuilderMembership({ clinicId, openComposer, onComposerChange }: Props) {
  const { memberships, addMembership } = useMemberships(clinicId);

  const featuredMembership = useMemo(() => memberships[0], [memberships]);

  async function handleCreateMembership(nextMembership: MembershipRecord) {
    try {
      await addMembership(nextMembership);
    } catch (err) {
      console.error('Failed to create membership in Supabase:', err);
    }
    onComposerChange(false);
  }

  return (
    <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-6 h-full">
      {/* Phone preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
        <p className="text-xs text-gray-400 mb-3">Preview</p>
        {/* Smartphone Frame - iPhone style matching Offers tab, larger */}
        <div className="w-[300px] h-[580px] bg-[#1E293B] rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
          {/* Top Speaker/Camera notch */}
          <div className="w-24 h-4 bg-[#1E293B] rounded-b-xl mx-auto absolute top-3 left-1/2 -translate-x-1/2 z-20" />

          {/* Screen container */}
          <div className="w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col pt-10">
            {featuredMembership ? (
              <div className="h-full flex flex-col overflow-y-auto px-4 pb-4">
                <div className="text-center my-3">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {featuredMembership.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {featuredMembership.description || 'Premium monthly access with curated member perks.'}
                  </p>
                </div>

                {/* Membership image card inside phone */}
                <div className="mt-1 rounded-2xl overflow-hidden shadow-xs border border-slate-100 bg-slate-900 aspect-[4/3] relative flex-shrink-0">
                  <img
                    src={featuredMembership.imageUrl || defaultImage}
                    alt={featuredMembership.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1"><Users size={12} /> 0 members</span>
                    <span className="font-semibold text-slate-900">${featuredMembership.price}/mo</span>
                  </div>
                  {featuredMembership.commitmentEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2 py-1 text-[11px]">
                      <CalendarDays size={11} /> {featuredMembership.commitmentMonths} months commitment
                    </span>
                  )}
                  {featuredMembership.benefits.length > 0 && (
                    <div className="space-y-1.5">
                      {featuredMembership.benefits.map((benefit) => (
                        <span key={benefit} className="block rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-[11px] text-slate-600">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  )}
                  <button className="w-full rounded-xl bg-pink-500 py-2.5 text-xs font-semibold text-white shadow-sm">
                    Join membership
                  </button>
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
            <div className="h-full flex flex-col items-center justify-center py-8">
              <EmptyState
                title="Create your first membership!"
                description="Design recurring plans, configure pricing, and add signup bonuses that automatically reward new members."
                action={{
                  label: "Create a new membership",
                  onClick: () => onComposerChange(true),
                }}
              />
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
