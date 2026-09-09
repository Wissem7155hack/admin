import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Smartphone, ExternalLink } from 'lucide-react';

interface ViewAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName?: string;
  merchantName?: string;
}

export default function ViewAppModal({
  isOpen,
  onClose,
  clinicName,
  merchantName = 'Beauty2Go Clinic',
}: ViewAppModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full screen backdrop with blur covering entire viewport */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <Smartphone className="text-pink-500" size={20} />
            <h3 className="text-lg font-bold">Preview {clinicName || merchantName} App</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-xs">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center">
            <div className="w-32 h-32 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center p-2 mb-3">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://app.nexcore.io/demo"
                alt="App QR"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm font-bold text-slate-900">Scan to open on iOS / Android</p>
            <p className="text-slate-500 mt-1">Open your phone camera to test live mobile flow</p>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <ExternalLink size={16} className="text-slate-400" />
              <span className="font-mono text-slate-700">app.nexcore.io/live-preview</span>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Opening web preview sandbox');
              }}
              className="text-pink-600 font-semibold hover:text-pink-700"
            >
              Open Web Preview →
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
export { ViewAppModal };
