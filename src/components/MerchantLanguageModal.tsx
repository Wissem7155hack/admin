import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Check } from 'lucide-react';
import { Merchant } from '../types';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
];

export interface MerchantLanguageModalProps {
  isOpen: boolean;
  merchant: Merchant | null;
  onClose: () => void;
  onSelectLanguage?: (merchantId: string, language: string) => void;
  onSave?: (merchantId: string, language: string) => void;
}

export const MerchantLanguageModal: React.FC<MerchantLanguageModalProps> = ({
  isOpen,
  merchant,
  onClose,
  onSelectLanguage,
  onSave,
}) => {
  const [selectedLang, setSelectedLang] = useState(merchant?.language ?? 'English');

  useEffect(() => {
    if (isOpen && merchant) {
      setSelectedLang(merchant.language ?? 'English');
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
    }
  }, [isOpen, merchant, onClose]);

  if (!isOpen || !merchant) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(merchant.id, selectedLang);
    } else if (onSelectLanguage) {
      onSelectLanguage(merchant.id, selectedLang);
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200/80 p-6 flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <Globe className="text-pink-500" size={18} />
            <h3 className="text-sm font-bold">Select Clinic Language</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1.5 py-1">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang.toLowerCase() === lang.name.toLowerCase();
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang.name)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                  isSelected ? 'bg-pink-50 text-pink-700 font-bold border border-pink-200' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check size={14} className="text-pink-600" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Save Language
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
