import { useState } from 'react';
import { ImageIcon, Palette, Languages, Check, Upload } from 'lucide-react';

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

export default function WhiteLabelSettings() {
  const [selectedColor, setSelectedColor] = useState('#ec4899');
  const [customColor, setCustomColor] = useState('#EC4899');
  const [language, setLanguage] = useState('English');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-8">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in">
          <Check size={16} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">White Label Settings</h1>
      <p className="text-sm text-slate-400 mb-8">Customize your agency branding and configure custom domains.</p>

      {/* Logo & Favicon row matching white label screenshot */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Logo */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <ImageIcon size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Logo</p>
                <p className="text-xs text-slate-400">Your agency logo</p>
              </div>
            </div>

            <div className="flex items-center gap-5 my-4">
              <div className="w-40 h-20 border border-slate-200 rounded-2xl flex items-center justify-center bg-white shadow-xs">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Nexcore</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-3">Upload a logo image (PNG, JPG, max 5MB)</p>
                <button
                  onClick={() => showToast('Logo updated successfully')}
                  className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
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
                  onClick={() => showToast('Favicon updated successfully')}
                  className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Upload size={14} className="text-slate-400" />
                  Change Icon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Color */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
            <Palette size={18} className="text-pink-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Brand Color</p>
            <p className="text-xs text-slate-400">Your primary agency brand color</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setCustomColor(color);
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                style={{ backgroundColor: color }}
              >
                {selectedColor.toLowerCase() === color.toLowerCase() && (
                  <Check size={16} className="text-white" strokeWidth={3} />
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
              className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shadow-xs"
            />

            <span className="text-sm font-mono font-bold text-slate-700 uppercase">
              {customColor}
            </span>
          </div>

          <button
            onClick={() => showToast('Brand color saved!')}
            className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Check size={14} /> Save Color
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
            <p className="text-sm font-bold text-slate-900">Default Language</p>
            <p className="text-xs text-slate-400">Set the default language for newly created merchants</p>
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
            onClick={() => showToast('Default language saved!')}
            className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Check size={14} /> Save Language
          </button>
        </div>
      </div>
    </div>
  );
}
