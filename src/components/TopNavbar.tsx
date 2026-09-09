import { QrCode, UserRound } from 'lucide-react';

interface TopNavbarProps {
  greeting?: string;
  userName?: string;
  onOpenQrScan: () => void;
  onOpenUserSettings: () => void;
}

export default function TopNavbar({
  greeting,
  userName = 'The Laser Club UK',
  onOpenQrScan,
  onOpenUserSettings,
}: TopNavbarProps) {
  const displayGreeting = greeting || `Hello ${userName} 👋🏻`;

  return (
    <header className="h-16 px-8 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between sticky top-0 z-30 flex-shrink-0 transition-colors">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{displayGreeting}</span>
        </h1>
      </div>

      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onOpenUserSettings}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all group cursor-pointer"
        >
          <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
            {userName}
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-800 transition-colors">
            <UserRound size={15} />
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenQrScan}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-bold shadow-sm shadow-pink-200 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
        >
          <QrCode size={15} />
          <span>Scan QR</span>
        </button>
      </div>
    </header>
  );
}
