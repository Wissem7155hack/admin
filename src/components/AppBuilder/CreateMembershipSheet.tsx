import { ChangeEvent, useState, useEffect } from 'react';
import { UploadCloud, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import SignupBonusSheet from './SignupBonusSheet';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { MembershipRecord, SignupBonus } from '../../types';
import { uploadMembershipAsset, handleImageError } from '../../hooks/useSupabaseData';

interface Props {
  isOpen?: boolean;
  onClose: () => void;
  onSave: (membership: Partial<MembershipRecord>) => Promise<void> | void;
  editingMembership?: MembershipRecord | null;
  clinicId?: string;
  clinicName?: string;
}

const defaultImage = '/images/spa-membership.jpg';

export default function CreateMembershipSheet({
  isOpen = true,
  onClose,
  onSave,
  editingMembership,
  clinicId,
  clinicName = 'SLA Medical Clinic',
}: Props) {
  const isEditing = Boolean(editingMembership);

  const [showSignupBonus, setShowSignupBonus] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(0);
  const [interval, setInterval] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(defaultImage);
  const [commitmentEnabled, setCommitmentEnabled] = useState(false);
  const [commitmentMonths, setCommitmentMonths] = useState<number | ''>(0);
  const [bonuses, setBonuses] = useState<SignupBonus[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [nextBenefit, setNextBenefit] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Pre-populate fields on open / edit
  useEffect(() => {
    if (editingMembership) {
      setName(editingMembership.name || editingMembership.tier_name || editingMembership.title || '');
      setPrice(Number(editingMembership.price ?? editingMembership.monthly_price ?? 0));
      setInterval((editingMembership.interval as any) || 'monthly');
      setDescription(editingMembership.description || '');
      setImageUrl(editingMembership.imageUrl || editingMembership.image_url || defaultImage);
      setImageError(false);
      const months = Number(editingMembership.commitmentMonths ?? editingMembership.commitment_months ?? 0);
      setCommitmentEnabled(editingMembership.commitmentEnabled ?? months > 0);
      setCommitmentMonths(months > 0 ? months : '');
      setBenefits(Array.isArray(editingMembership.benefits) ? [...editingMembership.benefits] : (Array.isArray(editingMembership.perks) ? [...editingMembership.perks] : []));
      setBonuses(Array.isArray(editingMembership.bonuses) ? [...editingMembership.bonuses] : []);
    } else {
      setName('');
      setPrice('');
      setInterval('monthly');
      setDescription('');
      setImageUrl(defaultImage);
      setImageError(false);
      setCommitmentEnabled(false);
      setCommitmentMonths('');
      setBenefits([]);
      setBonuses([]);
    }
    setFormError(null);
  }, [editingMembership, isOpen]);

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setImageError(false);
      const publicUrl = await uploadMembershipAsset(file);
      setImageUrl(publicUrl);
    } catch (err) {
      console.warn('Failed to upload membership image to storage, fallback to local URL:', err);
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setUploadingImage(false);
    }
  }

  function addBenefit() {
    if (!nextBenefit.trim()) return;
    setBenefits((prev) => [...prev, nextBenefit.trim()]);
    setNextBenefit('');
  }

  function removeBenefit(index: number) {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddBonus(bonus: SignupBonus) {
    setBonuses((prev) => [...prev, bonus]);
  }

  function removeBonus(index: number) {
    setBonuses((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setFormError('Please enter a membership tier name');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const numericPrice = price === '' ? 0 : Number(price);
      const numericMonths = commitmentMonths === '' ? 0 : Number(commitmentMonths);

      const payload: Partial<MembershipRecord> = {
        name: name.trim(),
        title: name.trim(),
        tier_name: name.trim(),
        price: numericPrice,
        monthly_price: numericPrice,
        interval,
        description: description.trim(),
        imageUrl,
        image_url: imageUrl,
        commitmentEnabled,
        commitment_enabled: commitmentEnabled,
        commitmentMonths: commitmentEnabled ? numericMonths : 0,
        commitment_months: commitmentEnabled ? numericMonths : 0,
        benefits,
        perks: benefits,
        bonuses,
      };

      if (clinicId) {
        payload.clinic_id = clinicId;
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error('Error saving membership:', err);
      setFormError(err.message || 'Failed to save membership tier');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <SlideOverDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? 'Edit membership' : 'Create a membership'}
        maxWidth="max-w-xl"
        showCloseX={true}
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create membership'}
            </button>
          </>
        }
      >
        <div className="space-y-6 text-xs pb-6">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Basic info */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Basic information</h3>
            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Membership name <span className="text-pink-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SLA VIP, Refined Method"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price per month</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 rounded-l-xl text-gray-500 text-xs">
                    £
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-r-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Billing Interval</label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Active Clinic</label>
                <input
                  disabled
                  value={clinicName}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Membership tier description, privileges, and conditions..."
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 placeholder:text-gray-400 resize-none"
              />
            </div>
          </section>

          {/* Picture with onError fallback */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Membership Picture</h3>
            
            {imageUrl && !imageError ? (
              <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-gray-200 group bg-gray-100">
                <img
                  src={imageUrl}
                  alt="Membership tier cover"
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label
                    htmlFor="replace-membership-image"
                    className="px-3.5 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-semibold cursor-pointer shadow hover:bg-gray-50"
                  >
                    Change photo
                  </label>
                  <input
                    id="replace-membership-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl(defaultImage);
                      setImageError(false);
                    }}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-pink-400 transition-colors bg-gray-50/50">
                <input
                  id="membership-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="membership-image" className="cursor-pointer block">
                  <UploadCloud className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-xs font-semibold text-gray-700">
                    {uploadingImage ? 'Uploading to membership-media bucket...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">PNG or JPG (saved to membership-media CDN)</p>
                </label>
              </div>
            )}
          </section>

          {/* Commitment */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Commitment period (optional)</h3>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
              <span className="text-xs text-gray-700 font-medium">Enable minimum commitment period</span>
              <input
                type="checkbox"
                checked={commitmentEnabled}
                onChange={(e) => setCommitmentEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400 cursor-pointer"
              />
            </div>
            {commitmentEnabled && (
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={commitmentMonths}
                  onChange={(e) => setCommitmentMonths(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 3, 6, 12"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                  months
                </span>
              </div>
            )}
          </section>

          {/* Membership benefits */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Membership benefits (optional)</h3>
              <span className="text-[11px] text-gray-400">{benefits.length} perks</span>
            </div>
            <div className="flex gap-2">
              <input
                value={nextBenefit}
                onChange={(e) => setNextBenefit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBenefit();
                  }
                }}
                placeholder="Example: 15% off advanced laser treatments"
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            {benefits.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs text-gray-700"
                  >
                    <span className="flex-1 font-medium">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      className="text-gray-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                      title="Remove perk"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Signup bonuses */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Signup Bonuses (optional)</h3>
              <button
                type="button"
                onClick={() => setShowSignupBonus(true)}
                className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                Add signup bonus
              </button>
            </div>
            {bonuses.length > 0 && (
              <div className="space-y-2">
                {bonuses.map((bonus, idx) => (
                  <div
                    key={bonus.id || idx}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 flex items-start justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {bonus.discountType || 'Bonus'} - {bonus.availability || 'Immediate'}
                      </p>
                      <p className="text-gray-500 mt-0.5">{bonus.description || 'Welcome perk'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBonus(idx)}
                      className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                      title="Remove bonus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </SlideOverDrawer>

      {showSignupBonus && (
        <SignupBonusSheet
          onClose={() => setShowSignupBonus(false)}
          onSave={(bonus) => {
            handleAddBonus(bonus);
            setShowSignupBonus(false);
          }}
        />
      )}
    </>
  );
}
