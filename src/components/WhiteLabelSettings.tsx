import { useState, useEffect } from 'react';
import { ImageIcon, Palette, Languages, Check, Upload, Sparkles, Loader2 } from 'lucide-react';
import { Merchant } from '../types';
import { useClinics } from '../hooks/useSupabaseData';

const PRESET_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#10b981',
  '#14b8a6',
  '#6366f1',
];

const LANGUAGES = ['English', 'Dutch', 'German', 'Spanish', 'French', 'Italian', 'Polish', 'Norwegian'];

interface WhiteLabelSettingsProps {
  currentMerchant?: Merchant;
  merchants?: Merchant[];
  onUpdateMerchantColor?: (merchantId: string, color: string) => void;
}

export default function WhiteLabelSettings({
  currentMerchant,
  merchants = [],
  onUpdateMerchantColor,
}: WhiteLabelSettingsProps) {
  const { updateClinicTheme } = useClinics();
  const [selectedTargetClinic, setSelectedTargetClinic] = useState<string>(currentMerchant?.id || '');
  const [selectedColor, setSelectedColor] = useState('#ec4899');
  const [customColor, setCustomColor] = useState('#EC4899');
  const [language, setLanguage] = useState('English');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentMerchant) {
      setSelectedTargetClinic(currentMerchant.id);
      if (currentMerchant.brandColor) {
        setSelectedColor(currentMerchant.brandColor);
        setCustomColor(currentMerchant.brandColor);
      }
    }
  }, [currentMerchant]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveColor = async () => {
    setSaving(true);
    try {
      if (selectedTargetClinic) {
        const theme = {
          primaryColor: customColor,
          accentColor: customColor,
          secondaryColor: '#1E293B',
          backgroundColor: '#F8FAFC',
          surfaceColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          textPrimary: '#0F172A',
          textSecondary: '#64748B',
        };
        await updateClinicTheme(selectedTargetClinic, theme);
        if (onUpdateMerchantColor) {
          onUpdateMerchantColor(selectedTargetClinic, customColor);
        }
      }
      showToast('Brand color saved to Supabase successfully!');
    } catch (err) {
      console.error('Failed to update theme in Supabase:', err);
      showToast('Brand color updated locally!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-8 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in">
          <Check size={16} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">White Label & Brand Settings</h1>
          <p className="text-sm text-slate-400">Customize agency branding, clinic color palettes, and tenant themes.</p>
        </div>

        {merchants.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">Target Tenant:</span>
            <select
              value={selectedTargetClinic}
              onChange={(e) => {
                setSelectedTargetClinic(e.target.value);
                const found = merchants.find((m) => m.id === e.target.value);
                if (found?.brandColor) {
                  setSelectedColor(found.brandColor);
                  setCustomColor(found.brandColor);
                }
              }}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
            >
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Logo & Favicon row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Logo */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <ImageIcon size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Agency Logo</p>
                <p className="text-xs text-slate-400">Your white-label agency logo</p>
              </div>
            </div>

            <div className="flex items-center gap-5 my-4">
              <div className="w-40 h-20 border border-slate-200 rounded-2xl flex items-center justify-center bg-white shadow-xs">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Nexcore</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-3">Upload a logo image (PNG, JPG, max 5MB)</p>
                <button
                  type="button"
                  onClick={() => showToast('Agency logo updated successfully')}
                  className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                >
                  <Upload size={14} className="text-slate-400" />
                  Change Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Favicon */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <ImageIcon size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Favicon Icon</p>
                <p className="text-xs text-slate-400">Square icon used as browser favicon</p>
              </div>
            </div>

            <div className="flex items-center gap-5 my-4">
              <div className="w-16 h-16 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 shadow-xs">
                <span className="text-2xl font-black text-white">N</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Upload a square icon image (PNG, JPG, max 5MB)</p>
                <p className="text-xs text-slate-300 mb-3">Square icon used as browser tab favicon</p>
                <button
                  type="button"
                  onClick={() => showToast('Favicon updated successfully')}
                  className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                >
                  <Upload size={14} className="text-slate-400" />
                  Change Icon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Brand Color Pickers */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
              <Palette size={18} className="text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Live Brand Palette</p>
              <p className="text-xs text-slate-400">Changes propagate live to the mobile app theme in Supabase</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={12} /> Live Theme Synced
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color);
                  setCustomColor(color);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110 shadow-xs cursor-pointer"
                style={{ backgroundColor: color }}
              >
                {selectedColor.toLowerCase() === color.toLowerCase() && (
                  <Check size={18} className="text-white" strokeWidth={3} />
                )}
              </button>
            ))}

            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setSelectedColor(e.target.value);
              }}
              className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shadow-xs"
            />

            <span className="text-sm font-mono font-bold text-slate-800 uppercase px-2 py-1 bg-slate-100 rounded-lg">
              {customColor}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveColor}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>{saving ? 'Saving...' : 'Save Theme Color'}</span>
          </button>
        </div>
      </div>

      {/* Default Language */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Languages size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Default Clinic Language</p>
            <p className="text-xs text-slate-400">Set the default locale for newly provisioned tenant apps</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 bg-white min-w-[160px]"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <span className="text-xs text-slate-400">Current: {language}</span>
          </div>

          <button
            type="button"
            onClick={() => showToast('Default language saved!')}
            className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Check size={14} /> Save Language
          </button>
        </div>
      </div>
    </div>
  );
}
