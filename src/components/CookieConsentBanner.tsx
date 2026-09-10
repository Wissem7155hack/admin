import { ShieldCheck, Sliders, Check, X } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import PrivacySettingsModal from './PrivacySettingsModal';

export default function CookieConsentBanner() {
  const {
    isBannerOpen,
    isPreferencesOpen,
    isSaving,
    openPreferences,
    closePreferences,
    acceptAll,
    rejectNonEssential,
  } = useCookieConsent();

  return (
    <>
      {/* GDPR Cookie Consent Floating Banner */}
      {isBannerOpen && (
        <div
          role="dialog"
          aria-label="Cookie consent management"
          className="fixed bottom-5 left-5 right-5 md:left-auto md:right-6 md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-[#0B0D13]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/80 text-white">
            <div className="flex items-start gap-3.5 mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 text-pink-400">
                <ShieldCheck size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                    Privacy & Cookie Preferences
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    GDPR Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We use cookies and secure sessions to ensure medical data safety, analyze platform
                  performance, and personalize your clinic dashboard experience. Essential cookies are
                  always active.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={openPreferences}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Sliders size={14} className="text-slate-400" />
                <span>Customize</span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={rejectNonEssential}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <X size={14} className="text-slate-400" />
                  <span>Reject Non-Essential</span>
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-500/30 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Check size={14} />
                  <span>Accept All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Center Modal */}
      {isPreferencesOpen && (
        <PrivacySettingsModal
          isOpen={isPreferencesOpen}
          onClose={closePreferences}
        />
      )}
    </>
  );
}
