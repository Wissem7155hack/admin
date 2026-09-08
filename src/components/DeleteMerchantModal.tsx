import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Merchant } from '../types';

interface DeleteMerchantModalProps {
  isOpen: boolean;
  merchant: Merchant | null;
  onClose: () => void;
  onConfirmDelete: (merchantId: string) => void;
}

export const DeleteMerchantModal: React.FC<DeleteMerchantModalProps> = ({
  isOpen,
  merchant,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const merchantName = merchant?.name ?? '';
  const nameMatches =
    confirmName.trim().length > 0 &&
    confirmName.trim().toLowerCase() === merchantName.trim().toLowerCase();

  useEffect(() => {
    if (isOpen) {
      setConfirmName('');
      setError('');
      setIsDeleting(false);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !merchant) return null;

  const handleDelete = () => {
    if (!nameMatches) {
      setError('The merchant name you typed does not match.');
      return;
    }
    setIsDeleting(true);
    setTimeout(() => {
      onConfirmDelete(merchant.id);
      setIsDeleting(false);
      onClose();
    }, 400);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full screen backdrop with blur covering entire page */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/80 p-6 flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Merchant</h3>
              <p className="text-xs text-slate-500">This action cannot be undone.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl text-rose-800 leading-relaxed">
            You are about to delete <strong className="font-bold">{merchantName}</strong>. All associated clinic data, treatments, client profiles, and settings will be permanently removed.
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Type <span className="font-mono font-bold text-slate-900 select-all">{merchantName}</span> to confirm:
            </label>
            <input
              ref={inputRef}
              type="text"
              value={confirmName}
              onChange={(e) => {
                setConfirmName(e.target.value);
                if (error) setError('');
              }}
              placeholder={merchantName}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {error && <p className="text-rose-600 text-[11px] mt-1">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!nameMatches || isDeleting}
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            <span>Delete Merchant</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
