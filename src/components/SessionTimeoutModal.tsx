import { Clock, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingSeconds: number | null;
  onStayLoggedIn: () => void;
  onSignOut: () => void;
}

export default function SessionTimeoutModal({
  isOpen,
  remainingSeconds,
  onStayLoggedIn,
  onSignOut,
}: SessionTimeoutModalProps) {
  if (!isOpen) return null;

  const seconds = remainingSeconds !== null ? remainingSeconds : 120;
  const minutes = Math.floor(seconds / 60);
  const displaySeconds = (seconds % 60).toString().padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[#0B0D13] border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-white animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            <ShieldAlert size={26} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Session Inactivity Warning
            </h3>
            <p className="text-xs text-slate-400">
              Your secure administrative session will expire soon
            </p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-300 mb-1">
            <Clock size={18} className="animate-pulse" />
            <span className="text-2xl font-mono font-black tracking-wider">
              {minutes}:{displaySeconds}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            For data protection and HIPAA/GDPR compliance, sessions automatically log out after 30 minutes of inactivity.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSignOut}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out Now</span>
          </button>

          <button
            type="button"
            onClick={onStayLoggedIn}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-500/30 transition-all cursor-pointer"
          >
            <CheckCircle2 size={15} />
            <span>Stay Logged In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
