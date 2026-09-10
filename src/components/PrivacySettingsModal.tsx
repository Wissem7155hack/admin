import { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Shield,
  BarChart3,
  Sliders,
  Megaphone,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Database,
} from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import {
  REGISTERED_COOKIES,
  CURRENT_POLICY_VERSION,
  getOrCreateConsentUUID,
} from '../lib/cookieConsent';
import { CookieCategories } from '../types/gdpr';
import { sha256Hash } from '../lib/cryptoUtils';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacySettingsModal({ isOpen, onClose }: PrivacySettingsModalProps) {
  const { consent, savePreferences, acceptAll, rejectNonEssential, revokeConsent, isSaving } =
    useCookieConsent();

  const [categories, setCategories] = useState<CookieCategories>({
    necessary: true,
    analytics: consent.analytics,
    preferences: consent.preferences,
    marketing: consent.marketing,
  });

  const [showCookieList, setShowCookieList] = useState(false);
  const [consentUuid, setConsentUuid] = useState<string>('');
  const [ipHash, setIpHash] = useState<string>('');

  useEffect(() => {
    setCategories({
      necessary: true,
      analytics: consent.analytics,
      preferences: consent.preferences,
      marketing: consent.marketing,
    });
  }, [consent]);

  useEffect(() => {
    const uuid = getOrCreateConsentUUID();
    setConsentUuid(uuid);
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    sha256Hash(uuid + ua).then((h) => setIpHash(h.substring(0, 16) + '...'));
  }, []);

  if (!isOpen) return null;

  const toggleCategory = (key: keyof CookieCategories) => {
    if (key === 'necessary') return; // Cannot disable essential cookies
    setCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    await savePreferences(categories);
    onClose();
  };

  const handleAcceptAll = async () => {
    await acceptAll();
    onClose();
  };

  const handleRejectAll = async () => {
    await rejectNonEssential();
    onClose();
  };

  const handleRevoke = async () => {
    await revokeConsent();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0B0D13] border border-white/15 rounded-2xl shadow-2xl text-white overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Privacy Preference Center
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-pink-500/10 text-pink-300 border border-pink-500/30">
                  {CURRENT_POLICY_VERSION}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage your cookie categories and consent audit logging
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
            Nexcore values your privacy. In compliance with the General Data Protection Regulation
            (GDPR) and the ePrivacy Directive, you have full control over the cookies and tracking
            technologies stored on your device. Essential security cookies cannot be disabled as they
            are required for dashboard authentication and CSRF protection.
          </p>

          {/* Cookie Categories */}
          <div className="space-y-3">
            {/* Category 1: Strictly Necessary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Lock size={15} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Strictly Necessary & Security
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Required for Supabase Auth, PKCE session tokens, and security
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    Always Active
                  </span>
                </div>
              </div>
            </div>

            {/* Category 2: Analytics & Performance */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <BarChart3 size={15} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Analytics & Performance
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Collects anonymized platform diagnostics and performance logs
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCategory('analytics')}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    categories.analytics ? 'bg-pink-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      categories.analytics ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Category 3: User Preferences */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sliders size={15} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Personalization & Preferences
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Remembers sidebar layouts, theme presets, and clinic filters
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCategory('preferences')}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    categories.preferences ? 'bg-pink-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      categories.preferences ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Category 4: Marketing & Conversion */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Megaphone size={15} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Marketing & Attribution
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Measures patient app referral campaigns and promotional reach
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCategory('marketing')}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    categories.marketing ? 'bg-pink-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      categories.marketing ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Cookie Registry Transparency Drawer */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
            <button
              type="button"
              onClick={() => setShowCookieList(!showCookieList)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Info size={15} className="text-pink-400" />
                <span>View Registered Cookies & Subprocessors ({REGISTERED_COOKIES.length})</span>
              </div>
              {showCookieList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showCookieList && (
              <div className="p-4 border-t border-white/10 overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="pb-2 font-semibold">Cookie Identifier</th>
                      <th className="pb-2 font-semibold">Provider</th>
                      <th className="pb-2 font-semibold">Purpose</th>
                      <th className="pb-2 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {REGISTERED_COOKIES.map((c) => (
                      <tr key={c.name}>
                        <td className="py-2.5 font-mono text-pink-300 pr-3">{c.name}</td>
                        <td className="py-2.5 pr-3">{c.provider}</td>
                        <td className="py-2.5 pr-3 text-slate-400">{c.purpose}</td>
                        <td className="py-2.5 whitespace-nowrap">{c.expiry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Audit Trail Badge */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <Database size={13} className="text-emerald-400" />
              <span>Consent UUID:</span>
              <span className="font-mono text-slate-200">{consentUuid.substring(0, 18)}...</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Anonymized IP Hash:</span>
              <span className="font-mono text-slate-200">{ipHash}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            type="button"
            onClick={handleRevoke}
            disabled={isSaving}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Revoke All Consent</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleRejectAll}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              Reject All
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              Accept All
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-500/30 transition-all cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
