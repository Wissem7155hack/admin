import React, { useState } from 'react';
import { ArrowLeft, Check, Plus, Upload, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';
import SlideOverDrawer from './common/SlideOverDrawer';
import { TeamMember } from '../types';

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState<'Team' | 'Notifications' | 'Payouts'>('Team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [openAddDrawer, setOpenAddDrawer] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenAddDrawer(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [akaName, setAkaName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');

  const [notifAppUser, setNotifAppUser] = useState(true);
  const [notifSaleSms, setNotifSaleSms] = useState(true);
  const [notifKaChing, setNotifKaChing] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    const newMember: TeamMember = {
      id: Date.now().toString(),
      firstName,
      lastName,
      akaName,
      jobTitle: jobTitle || 'Specialist',
      biography: bio,
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setFirstName('');
    setLastName('');
    setAkaName('');
    setJobTitle('');
    setBio('');
    setOpenAddDrawer(false);
    showToast('Team member added successfully!');
  };

  return (
    <div className="flex-1 bg-slate-50 p-8 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">User Settings</h1>

      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in">
          <Check size={16} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-2 space-y-1">
          {(['Team', 'Notifications', 'Payouts'] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-slate-50 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                <span>{tab}</span>
                {active && <ChevronRight size={15} className="text-slate-400" />}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-8 min-h-[60vh] flex flex-col">
          {activeTab === 'Team' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Team</h2>
                {teamMembers.length > 0 && (
                  <button
                    onClick={() => setOpenAddDrawer(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold shadow-xs"
                  >
                    <Plus size={15} /> Add team member
                  </button>
                )}
              </div>

              {teamMembers.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <EmptyState
                    title="Create your first team member!"
                    description="Assign treatments, manage staff schedules, and track individual MRR and sales."
                  />
                  <button
                    onClick={() => setOpenAddDrawer(true)}
                    className="mt-2 w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-transform hover:scale-105"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {teamMembers.map((m) => (
                    <div key={m.id} className="p-4 border border-slate-200 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-base">
                        {m.firstName[0]}{m.lastName ? m.lastName[0] : ''}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-slate-500">{m.jobTitle} {m.akaName ? `(${m.akaName})` : ''}</p>
                        {m.biography && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{m.biography}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="max-w-lg space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Notifications</h2>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-800">New app user notification</span>
                <button
                  type="button"
                  onClick={() => setNotifAppUser(!notifAppUser)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifAppUser ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifAppUser ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-800">New Sale SMS notification</span>
                <button
                  type="button"
                  onClick={() => setNotifSaleSms(!notifSaleSms)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifSaleSms ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifSaleSms ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-800">New sale ka-ching sound</span>
                <button
                  type="button"
                  onClick={() => setNotifKaChing(!notifKaChing)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifKaChing ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifKaChing ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => showToast('Notification preferences saved!')}
                className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'Payouts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Payouts Settings</h2>
                <button
                  onClick={() => showToast('Redirecting to Stripe Connect onboarding...')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  Connect Stripe
                </button>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">App earnings</p>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center">
                  <span className="text-4xl font-bold text-slate-900 block mb-1">$0</span>
                  <span className="text-xs text-slate-400 block mb-3">Balance</span>
                  <div className="border-t border-slate-200 pt-3 text-xs text-slate-500">
                    Next payout will be <strong className="text-slate-800">$0 in 1 day</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center py-10">
                <EmptyState
                  title="No payouts yet"
                  description="Connect your Stripe account to receive direct payouts for patient app purchases."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <SlideOverDrawer
        isOpen={openAddDrawer}
        onClose={() => setOpenAddDrawer(false)}
        title="Add a team member"
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenAddDrawer(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="team-form"
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
            >
              Add team member
            </button>
          </>
        }
      >
        <form id="team-form" onSubmit={handleAddTeamMember} className="space-y-6 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Profile picture</label>
            <div className="border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-center">
              <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-2">
                <Upload size={16} />
              </div>
              <p className="text-xs font-semibold text-slate-700">Click to upload or drag and drop</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG or JPG (max. 1920x1080px)</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-700">Informations</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
              <div>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <input
                value={akaName}
                onChange={(e) => setAkaName(e.target.value)}
                placeholder="Aka name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            <div>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Job title"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Biography</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell patients about this team member..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        </form>
      </SlideOverDrawer>
    </div>
  );
}
