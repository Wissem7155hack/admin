import { ChangeEvent, useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  UploadCloud,
  MoreVertical,
} from 'lucide-react';
import { SlideOverDrawer } from '../common/SlideOverDrawer';
import {
  MembershipRecord,
  MembershipTreatment,
} from '../../types';
import { uploadMembershipAsset } from '../../hooks/useSupabaseData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (membership: MembershipRecord) => void;
  editingMembership?: MembershipRecord | null;
}

const DEFAULT_BG = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';
const DEFAULT_CLIENT_PHOTO = 'https://jndcmymcnivessmvzpzc.supabase.co/storage/v1/object/public/membership-media/client-results/before_after.webp';

export default function MembershipDrawerModal({
  isOpen,
  onClose,
  onSave,
  editingMembership,
}: Props) {
  const isEditing = !!editingMembership;

  const [name, setName] = useState('Refined Method');
  const [price, setPrice] = useState(149);
  const [currency, setCurrency] = useState('£');
  const [imageUrl, setImageUrl] = useState(DEFAULT_BG);
  const [description, setDescription] = useState(
    'The Refined Method is your key to consistently radiant skin. This membership provides exclusive access to our most effective treatments at Refined Skin And Body, ensuring your complexion remains flawless year-round. Enjoy a curated selection of monthly services and member-only discounts on advanced procedures. For optimal, transformative results, a commitment of at least 6 months is recommended.'
  );

  const [commitmentEnabled, setCommitmentEnabled] = useState(true);
  const [commitmentMonths, setCommitmentMonths] = useState(6);

  // Bullets / Benefits
  const [benefitsList, setBenefitsList] = useState<string[]>([
    '15% Off Advanced Laser Resurfacing Procedures',
    '15% Off All Advanced Facial Treatments',
    '15% Off Skin Rejuvenation Services Like Microneedling And Peels',
  ]);
  const [newBenefitText, setNewBenefitText] = useState('');

  // Included products (Treatments)
  const [includedProducts, setIncludedProducts] = useState<MembershipTreatment[]>([
    {
      id: '1',
      name: 'HydraFacial',
      count: 1,
      unit: '1 treatment',
      description:
        'The HydraFacial delivers unparalleled skin refinement, deep hydration, and luminous radiance, leaving your complexion smooth, refreshed, and exceptionally glowing after just one session.',
      photoUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=300',
    },
    {
      id: '2',
      name: 'Microneedling',
      count: 1,
      unit: '1 treatment',
      description: 'Stimulate natural collagen and elastin production for smoother, firmer texture.',
      photoUrl: 'https://images.unsplash.com/photo-1512290900672-1f02e60f0898?auto=format&fit=crop&q=80&w=300',
    },
    {
      id: '3',
      name: 'Chemical Peels',
      count: 1,
      unit: '1 treatment',
      description: 'Target hyperpigmentation, fine lines, and active breakouts with clinical exfoliation.',
      photoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300',
    },
  ]);

  interface ClientTestimonialItem {
    id: string;
    photoUrl: string;
    text: string;
  }

  // Multi-Client Results list (Add, Change photo, Delete specific result)
  const [testimonialsList, setTestimonialsList] = useState<ClientTestimonialItem[]>([
    {
      id: 'default-1',
      photoUrl: DEFAULT_CLIENT_PHOTO,
      text: "The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn't be happier with the results!",
    },
  ]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResultId, setUploadingResultId] = useState<string | null>(null);

  // Sync state on open/edit
  useEffect(() => {
    if (!isOpen) return;

    if (editingMembership) {
      setName(editingMembership.name || '');
      setPrice(editingMembership.price ?? 149);
      setCurrency(editingMembership.currency || '£');
      setImageUrl(editingMembership.imageUrl || DEFAULT_BG);
      setDescription(
        editingMembership.description ||
          'The Refined Method is your key to consistently radiant skin. This membership provides exclusive access to our most effective treatments at Refined Skin And Body, ensuring your complexion remains flawless year-round. Enjoy a curated selection of monthly services and member-only discounts on advanced procedures. For optimal, transformative results, a commitment of at least 6 months is recommended.'
      );
      setCommitmentEnabled(editingMembership.commitmentEnabled ?? true);
      setCommitmentMonths(editingMembership.commitmentMonths || 6);

      if (editingMembership.benefits && editingMembership.benefits.length > 0) {
        setBenefitsList(editingMembership.benefits);
      } else {
        setBenefitsList([
          '15% Off Advanced Laser Resurfacing Procedures',
          '15% Off All Advanced Facial Treatments',
          '15% Off Skin Rejuvenation Services Like Microneedling And Peels',
        ]);
      }

      if (editingMembership.includedTreatments && editingMembership.includedTreatments.length > 0) {
        setIncludedProducts(editingMembership.includedTreatments);
      } else {
        setIncludedProducts([
          {
            id: '1',
            name: 'HydraFacial',
            count: 1,
            unit: '1 treatment',
            description:
              'The HydraFacial delivers unparalleled skin refinement, deep hydration, and luminous radiance, leaving your complexion smooth, refreshed, and exceptionally glowing after just one session.',
            photoUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=300',
          },
        ]);
      }

      if (editingMembership.testimonials && editingMembership.testimonials.length > 0) {
        setTestimonialsList(
          editingMembership.testimonials.map((t, idx) => ({
            id: (t as any).id || (Date.now() + idx).toString(),
            photoUrl: t.photoUrl || DEFAULT_CLIENT_PHOTO,
            text: t.text || '',
          }))
        );
      } else {
        setTestimonialsList([
          {
            id: 'default-1',
            photoUrl: DEFAULT_CLIENT_PHOTO,
            text: "The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn't be happier with the results!",
          },
        ]);
      }
    } else {
      setName('Refined Method');
      setPrice(149);
      setCurrency('£');
      setImageUrl(DEFAULT_BG);
      setDescription(
        'The Refined Method is your key to consistently radiant skin. This membership provides exclusive access to our most effective treatments at Refined Skin And Body, ensuring your complexion remains flawless year-round. Enjoy a curated selection of monthly services and member-only discounts on advanced procedures. For optimal, transformative results, a commitment of at least 6 months is recommended.'
      );
      setCommitmentEnabled(true);
      setCommitmentMonths(6);
      setBenefitsList([
        '15% Off Advanced Laser Resurfacing Procedures',
        '15% Off All Advanced Facial Treatments',
        '15% Off Skin Rejuvenation Services Like Microneedling And Peels',
      ]);
      setIncludedProducts([
        {
          id: '1',
          name: 'HydraFacial',
          count: 1,
          unit: '1 treatment',
          description:
            'The HydraFacial delivers unparalleled skin refinement, deep hydration, and luminous radiance, leaving your complexion smooth, refreshed, and exceptionally glowing after just one session.',
          photoUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=300',
        },
        {
          id: '2',
          name: 'Microneedling',
          count: 1,
          unit: '1 treatment',
          description: 'Stimulate natural collagen and elastin production for smoother, firmer texture.',
          photoUrl: 'https://images.unsplash.com/photo-1512290900672-1f02e60f0898?auto=format&fit=crop&q=80&w=300',
        },
        {
          id: '3',
          name: 'Chemical Peels',
          count: 1,
          unit: '1 treatment',
          description: 'Target hyperpigmentation, fine lines, and active breakouts with clinical exfoliation.',
          photoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300',
        },
      ]);
      setTestimonialsList([
        {
          id: 'default-1',
          photoUrl: DEFAULT_CLIENT_PHOTO,
          text: "The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn't be happier with the results!",
        },
      ]);
    }
  }, [editingMembership, isOpen]);

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await uploadMembershipAsset(file);
      setImageUrl(url);
    } catch (err) {
      console.warn('Fallback to local blob for cover image:', err);
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setUploadingImage(false);
    }
  }

  function handleAddTestimonial() {
    setTestimonialsList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        photoUrl: '',
        text: '',
      },
    ]);
  }

  function handleDeleteTestimonial(id: string) {
    setTestimonialsList((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleTestimonialPhotoUpload(id: string, file: File) {
    try {
      setUploadingResultId(id);
      const url = await uploadMembershipAsset(file);
      setTestimonialsList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, photoUrl: url } : t))
      );
    } catch {
      const local = URL.createObjectURL(file);
      setTestimonialsList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, photoUrl: local } : t))
      );
    } finally {
      setUploadingResultId(null);
    }
  }

  function handleClearTestimonialPhoto(id: string) {
    setTestimonialsList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, photoUrl: '' } : t))
    );
  }

  function handleTestimonialTextChange(id: string, text: string) {
    setTestimonialsList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t))
    );
  }

  function handleAddBenefit() {
    if (!newBenefitText.trim()) return;
    setBenefitsList((prev) => [...prev, newBenefitText.trim()]);
    setNewBenefitText('');
  }

  function handleAddProduct() {
    const newT: MembershipTreatment = {
      id: Date.now().toString(),
      name: 'HydraFacial',
      count: 1,
      unit: '1 treatment',
      description:
        'The HydraFacial delivers unparalleled skin refinement, deep hydration, and luminous radiance, leaving your complexion smooth, refreshed, and exceptionally glowing after just one session.',
      photoUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=300',
    };
    setIncludedProducts((prev) => [...prev, newT]);
  }

  function handleSave() {
    if (!name.trim()) return;

    const record: MembershipRecord = {
      id: editingMembership?.id || Date.now().toString(),
      name: name.trim(),
      tagline: `TRY ${name.toUpperCase()}`,
      subtitle: 'The membership that pays for itself',
      description: description.trim(),
      price: Number(price) || 0,
      currency,
      imageUrl,
      commitmentEnabled,
      commitmentMonths: commitmentEnabled ? Number(commitmentMonths) : 0,
      benefits: benefitsList,
      includedTreatments: includedProducts,
      treatmentsHeader: 'Included treatments',
      testimonials: testimonialsList.filter((t) => t.photoUrl || t.text.trim()),
      bonuses: [
        {
          id: 'bonus-gift',
          description: 'Sign up to immediately claim a complimentary HydraFacial!',
          availability: 'In-app',
          discountType: 'Free service',
          value: 0,
          products: [],
        },
      ],
      hideFromShop: false,
    };

    onSave(record);
  }

  return (
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit membership' : 'Create a membership'}
      maxWidth="max-w-2xl"
      showCloseX={true}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white rounded-full text-xs font-semibold shadow-md shadow-pink-200 transition-all cursor-pointer"
          >
            {isEditing ? 'Update membership' : 'Create membership'}
          </button>
        </>
      }
    >
      <div className="space-y-7 text-xs pb-6">
        {/* Section 1: Basic informations */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Basic informations</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Membership name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Refined Method"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Price per month</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={0}
                  value={price === 0 ? '' : price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="149"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs pr-9 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold"
                />
                <span className="absolute right-3.5 text-xs font-bold text-slate-700 pointer-events-none">
                  {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Membership Image */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Membership image</label>
            <div className="relative w-full aspect-[16/9] rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden group">
              <img src={imageUrl || DEFAULT_BG} alt="Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-3 right-3 w-7 h-7 bg-white/95 rounded-full shadow-md text-slate-600 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-all"
                title="Remove image"
              >
                <X size={15} />
              </button>

              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <input
                  id="edit-membership-drawer-img"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="edit-membership-drawer-img"
                  className="px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-800 shadow-md cursor-pointer hover:bg-slate-50 flex items-center gap-2"
                >
                  <UploadCloud size={15} />
                  <span>{uploadingImage ? 'Uploading...' : 'Change photo'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Membership description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The Refined Method is your key to consistently radiant skin..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Commitment period */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Commitment period</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-slate-800">Set commitment period</span>
              {/* Switch Toggle */}
              <button
                type="button"
                onClick={() => setCommitmentEnabled(!commitmentEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  commitmentEnabled ? 'bg-pink-500' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    commitmentEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                type="number"
                min={1}
                disabled={!commitmentEnabled}
                value={commitmentMonths}
                onChange={(e) => setCommitmentMonths(Number(e.target.value))}
                placeholder="6"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs pr-24 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold disabled:bg-slate-50 disabled:text-slate-400"
              />
              <span className="absolute right-3.5 text-xs text-slate-500 pointer-events-none">
                min. months
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Benefits (Office checkmark rows) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Membership benefits</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBenefitText}
                onChange={(e) => setNewBenefitText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
                placeholder="Add a new benefit..."
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs w-44 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {benefitsList.map((b, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex-1 pr-3">
                  <p className="text-xs font-bold text-slate-900">{b}</p>
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-xs">
                  <span>Office</span>
                  <button
                    type="button"
                    onClick={() => setBenefitsList(benefitsList.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Included products */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Included products</h4>
            <button
              type="button"
              onClick={handleAddProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-pink-300 rounded-full text-xs font-semibold text-slate-700 hover:text-pink-600 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Add included products</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <span className="text-xs font-bold text-slate-900">Every 1 Month(S)</span>
              <div className="flex items-center gap-3 text-slate-500 text-xs">
                <span>Rollover Allowed</span>
                <MoreVertical size={15} className="text-slate-400 cursor-pointer" />
              </div>
            </div>

            {/* Sub-list of individual treatments */}
            <div className="pl-3 space-y-2 border-l-2 border-slate-100 mt-2">
              {includedProducts.map((p, idx) => (
                <div key={p.id || idx} className="p-3 bg-slate-50/70 rounded-xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                      <img src={p.photoUrl || DEFAULT_BG} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{p.name}</h5>
                      <p className="text-[10px] text-slate-500">{p.unit || '1 treatment'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludedProducts(includedProducts.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Client results (optional) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">Client results (optional)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Showcase verified client before & after results and testimonials</p>
            </div>
            <button
              type="button"
              onClick={handleAddTestimonial}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-pink-300 rounded-full text-xs font-semibold text-slate-700 hover:text-pink-600 transition-colors cursor-pointer bg-white shadow-2xs"
            >
              <Plus size={13} />
              <span>Add client result</span>
            </button>
          </div>

          {testimonialsList.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-600">No client results added yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Before & after proof dramatically increases membership conversions</p>
              <button
                type="button"
                onClick={handleAddTestimonial}
                className="mt-3 px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                + Add first client result
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonialsList.map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Client Result #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonial(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete specific result"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before/After Photo Card */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Before / After photo</label>
                      <div className="relative w-full aspect-[4/3] rounded-xl border border-slate-200 overflow-hidden bg-slate-100 group flex items-center justify-center">
                        {item.photoUrl ? (
                          <>
                            <img
                              src={item.photoUrl}
                              onError={(e) => { e.currentTarget.src = '/images/before_after.webp'; }}
                              alt="Results"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleClearTestimonialPhoto(item.id)}
                              className="absolute top-2 right-2 w-6 h-6 bg-white/95 rounded-full shadow-sm text-slate-600 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-all"
                              title="Remove photo"
                            >
                              <X size={13} />
                            </button>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <input
                                id={'change-result-photo-' + item.id}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleTestimonialPhotoUpload(item.id, f);
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor={'change-result-photo-' + item.id}
                                className="px-3 py-1.5 bg-white text-slate-800 rounded-full text-xs font-bold shadow-md cursor-pointer hover:bg-slate-50 flex items-center gap-1.5"
                              >
                                <UploadCloud size={13} />
                                <span>{uploadingResultId === item.id ? 'Uploading...' : 'Change photo'}</span>
                              </label>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 flex flex-col items-center justify-center text-center w-full h-full">
                            <input
                              id={'upload-result-photo-' + item.id}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleTestimonialPhotoUpload(item.id, f);
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor={'upload-result-photo-' + item.id}
                              className="flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity w-full h-full"
                            >
                              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-1 shadow-xs">
                                <UploadCloud size={15} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700">
                                {uploadingResultId === item.id ? 'Uploading to Supabase...' : 'Click to upload photo'}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WebP</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Testimonial text block */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Testimonial</label>
                      <textarea
                        rows={5}
                        value={item.text}
                        onChange={(e) => handleTestimonialTextChange(item.id, e.target.value)}
                        placeholder="The transformation was unbelievable. My skin went from dull and tired to glowing and radiant..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none leading-relaxed h-[130px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SlideOverDrawer>
  );
}
