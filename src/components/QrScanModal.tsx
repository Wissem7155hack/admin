import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, QrCode, CheckCircle2 } from 'lucide-react';

interface QrScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QrScanModal({ isOpen, onClose }: QrScanModalProps) {
  const [code, setCode] = useState('');
  const [saved, setSaved] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full screen backdrop with blur covering entire page */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <QrCode className="text-pink-500" size={20} />
            <h3 className="text-lg font-bold">QR Code Scanner</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center">
            <div className="w-24 h-24 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center p-2 mb-3">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=nexcore-client-checkin"
                alt="Demo QR"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-semibold text-slate-700">Scan via in-clinic camera or input code</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Quickly check-in arriving app patients</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
              Or Enter 6-Digit Check-in Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 784920"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={code.length === 0}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm shadow-sm shadow-pink-200 transition-all flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} /> Saved!
              </>
            ) : (
              'Save'
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
export { QrScanModal };
