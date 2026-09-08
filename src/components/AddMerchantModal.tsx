import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Merchant } from '../types';

interface AddMerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMerchant: (merchant: Partial<Merchant>) => void;
}

export const AddMerchantModal: React.FC<AddMerchantModalProps> = ({ isOpen, onClose, onAddMerchant }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [brandColor, setBrandColor] = useState('#EC4899');
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [treatmentListUrl, setTreatmentListUrl] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD ($)');

  const [timezone, setTimezone] = useState('-05:00 Eastern Time - New York City, Brooklyn, Queens, Philadelphia');
  const [country, setCountry] = useState('United States');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('+1 (555) 234-5678');

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetForm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setStep(1);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setBusinessName('');
    setWebsiteUrl('');
    setTreatmentListUrl('');
    setDescription('');
    setAddress('');
    setPostalCode('');
    onClose();
  };

  const handleFinish = () => {
    onAddMerchant({
      name: businessName || 'New Clinic',
      clientsCount: 0,
      verified: false,
      status: 'active',
      brandColor: brandColor,
      language: 'English',
      initials: (businessName || 'NC').substring(0, 2).toUpperCase(),
    });
    setStep(4);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Full-screen backdrop covering entire viewport (sidebar, top navbar, everything) with blur */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200"
        onClick={resetForm}
      />

      {/* Modal Card */}
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-slate-900">
              {step === 4 ? 'Success' : 'Add New Merchant'}
            </h3>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper indicator if not success */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-50 bg-slate-50/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: 'Account' },
                { num: 2, label: 'Business' },
                { num: 3, label: 'Location' },
              ].map((s, idx) => {
                const isActive = step === s.num;
                const isPassed = step > s.num;
                return (
                  <React.Fragment key={s.num}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-pink-600 text-white shadow-sm ring-4 ring-pink-100'
                            : isPassed
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {s.num}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isActive ? 'text-slate-900 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div
                        className={`flex-1 h-[2px] mx-3 ${
                          isPassed ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">These will be the merchant's login credentials. You can share them later.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Glow Aesthetics Clinic"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Brand Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="CAD ($)">CAD ($)</option>
                  <option value="AUD ($)">AUD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Country / Region</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Clinic Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="ZIP / Postal code"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Merchant Created Successfully!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                <strong className="text-slate-800">{businessName}</strong> has been provisioned. They can now log in using {email}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          {step === 4 ? (
            <button
              type="button"
              onClick={resetForm}
              className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!firstName || !email)) return alert('Please fill in required fields');
                  if (step === 2 && !businessName) return alert('Please enter business name');
                  if (step === 3) return handleFinish();
                  setStep((step + 1) as any);
                }}
                className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
              >
                {step === 3 ? 'Create Merchant' : 'Next →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
