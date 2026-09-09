import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  MoreVertical,
  Sparkles,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from 'lucide-react';
import TagSelector from './TagSelector';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import ImageUploadDropzone from '../common/ImageUploadDropzone';
import { Product } from '../../types';
import { useTreatments, TreatmentRecord, useTeamMembers } from '../../hooks/useSupabaseData';

const SERVICE_UNIT_TYPES = [
  'Select unit type',
  'Treatment',
  'Session',
  'Unit',
  'Syringe',
  'Vial',
  'Package',
  'Area',
];

interface ProductsTabProps {
  clinicId?: string;
  clinicName?: string;
}

export default function ProductsTab({ clinicId }: ProductsTabProps) {
  const {
    treatments: supabaseTreatments,
    loading: treatmentsLoading,
    addTreatment,
    updateTreatment,
    deleteTreatment,
  } = useTreatments(clinicId);
  const { teamMembers } = useTeamMembers(clinicId);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const isEditMode = editingProduct !== null;

  // Form states matching Photo 1 & 2
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number | ''>(0);
  const [description, setDescription] = useState('');
  const [schedulingUrl, setSchedulingUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [serviceUnitType, setServiceUnitType] = useState('Select unit type');
  const [pricingModel, setPricingModel] = useState<'Individually' | 'In Bundles' | 'In Variations'>('Individually');
  const [price, setPrice] = useState<number | ''>(0);
  const [maxQuantity, setMaxQuantity] = useState<number | ''>(0);
  const [bundles, setBundles] = useState<{ quantity: number; price: number }[]>([
    { quantity: 3, price: 300 },
    { quantity: 6, price: 550 },
  ]);
  const [variations, setVariations] = useState<{ name: string; price: number }[]>([
    { name: 'Standard (Face)', price: 120 },
    { name: 'Intense (Face & Neck)', price: 180 },
  ]);
  const [treatmentImage, setTreatmentImage] = useState('');
  const [beforeInstructions, setBeforeInstructions] = useState('');
  const [afterInstructions, setAfterInstructions] = useState('');
  const [clientResultPhoto, setClientResultPhoto] = useState('');
  const [clientTestimonial, setClientTestimonial] = useState('');
  const [consultationWarning, setConsultationWarning] = useState(false);
  const [cashBalanceExclusion, setCashBalanceExclusion] = useState(false);
  const [otherOptionsOpen, setOtherOptionsOpen] = useState(true);
  const [hideFromShop, setHideFromShop] = useState(false);

  // Close 3-dots dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown-menu]') && !target.closest('[data-dropdown-trigger]')) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map Supabase treatments into local Product view
  useEffect(() => {
    if (supabaseTreatments && supabaseTreatments.length > 0) {
      const mapped: Product[] = supabaseTreatments.map((t: TreatmentRecord) => {
        const numPrice = typeof t.price === 'string' ? parseFloat(t.price) || 0 : t.price;
        const durMatch = t.duration ? parseInt(t.duration) : 0;
        let parsedTags: string[] = ['Smoothness', 'Texture'];
        if (t.tags && Array.isArray(t.tags) && t.tags.length > 0) {
          parsedTags = t.tags;
        } else if (t.category) {
          parsedTags = t.category.includes(',')
            ? t.category.split(',').map((s) => s.trim()).filter(Boolean)
            : [t.category.trim()];
        }

        return {
          id: t.id,
          name: t.name,
          durationMinutes: durMatch,
          description: t.description || '',
          schedulingUrl: t.scheduling_link || '',
          tags: parsedTags,
          serviceUnitType: t.service_unit_type || 'Treatment',
          pricingModel: (t.pricing_type as any) || 'Individually',
          price: numPrice,
          maxQuantity: 1,
          photoUrl: t.image,
          beforeInstructions: t.before_instructions || '',
          afterInstructions: t.after_instructions || '',
          requiresConsultation: t.requires_consultation || false,
          excludeCashBalance: t.restrict_cash_balance || false,
          hiddenFromShop: t.is_hidden || false,
          clientResults: t.client_results || [],
        };
      });
      setProducts(mapped);
    }
  }, [supabaseTreatments]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSchedulingUrl('');
    setDuration(0);
    setPrice(0);
    setMaxQuantity(0);
    setTreatmentImage('');
    setBeforeInstructions('');
    setAfterInstructions('');
    setClientResultPhoto('');
    setClientTestimonial('');
    setSelectedTags([]);
    setServiceUnitType('Select unit type');
    setPricingModel('Individually');
    setConsultationWarning(false);
    setCashBalanceExclusion(false);
    setHideFromShop(false);
    setEditingProduct(null);
  };

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDuration(product.durationMinutes || 0);
    setDescription(product.description || '');
    setSchedulingUrl(product.schedulingUrl || '');
    setSelectedTags(product.tags || []);
    setServiceUnitType(product.serviceUnitType || 'Select unit type');
    setPricingModel(product.pricingModel || 'Individually');
    setPrice(product.price ?? 0);
    setTreatmentImage(product.photoUrl || '');
    setMaxQuantity(product.maxQuantity ?? 0);
    setAfterInstructions(product.afterInstructions || '');
    setBeforeInstructions(product.beforeInstructions || '');
    setConsultationWarning(product.requiresConsultation || false);
    setCashBalanceExclusion(product.excludeCashBalance || false);
    setHideFromShop(product.hiddenFromShop || false);
    if (product.clientResults && product.clientResults.length > 0) {
      setClientResultPhoto(product.clientResults[0].photoUrl || '');
      setClientTestimonial(product.clientResults[0].testimonial || '');
    }
    setOpenDrawer(true);
  };

  const openCreateDrawer = () => {
    resetForm();
    setOpenDrawer(true);
  };

  const closeDrawer = () => {
    setOpenDrawer(false);
    setTimeout(resetForm, 320);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const finalPrice = pricingModel === 'Individually' ? Number(price || 0) : (bundles[0]?.price || 100);
      const categoryStr = selectedTags.length > 0 ? selectedTags.join(', ') : 'Treatment';

      const payload = {
        clinic_id: clinicId || '',
        name,
        category: categoryStr,
        price: finalPrice,
        duration: duration ? `${duration} mins` : '30 mins',
        description,
        image: treatmentImage || '/images/default-treatment.jpg',
        is_recommended: true,
        is_membership_only: false,
        scheduling_link: schedulingUrl,
        tags: selectedTags,
        service_unit_type: serviceUnitType === 'Select unit type' ? 'Treatment' : serviceUnitType,
        pricing_type: pricingModel,
        pricing_data: pricingModel === 'In Bundles' ? bundles : pricingModel === 'In Variations' ? variations : null,
        after_instructions: afterInstructions,
        before_instructions: beforeInstructions,
        requires_consultation: consultationWarning,
        restrict_cash_balance: cashBalanceExclusion,
        is_hidden: hideFromShop,
        client_results: clientTestimonial || clientResultPhoto ? [{ photoUrl: clientResultPhoto, testimonial: clientTestimonial }] : [],
      };

      let createdId = Date.now().toString();
      if (clinicId) {
        const created = await addTreatment(payload);
        if (created && created.id) {
          createdId = created.id;
        }
      }

      // Optimistic update with real ID
      const newProduct: Product = {
        id: createdId,
        name,
        durationMinutes: Number(duration) || 0,
        description,
        schedulingUrl,
        tags: selectedTags.length > 0 ? selectedTags : ['Smoothness', 'Texture'],
        serviceUnitType: serviceUnitType === 'Select unit type' ? 'Treatment' : serviceUnitType,
        pricingModel,
        price: finalPrice,
        maxQuantity: Number(maxQuantity) || 1,
        photoUrl: treatmentImage,
        bundles: pricingModel === 'In Bundles' ? bundles : undefined,
        variations: pricingModel === 'In Variations' ? variations : undefined,
        afterInstructions,
        beforeInstructions,
        requiresConsultation: consultationWarning,
        excludeCashBalance: cashBalanceExclusion,
        hiddenFromShop: hideFromShop,
        clientResults: clientTestimonial || clientResultPhoto ? [{ photoUrl: clientResultPhoto, testimonial: clientTestimonial }] : undefined,
      };

      setProducts((prev) => [newProduct, ...prev]);
      resetForm();
      setOpenDrawer(false);
    } catch (err: any) {
      console.error('Failed to create treatment in Supabase:', err);
      alert('Could not save to Supabase: ' + (err?.message || err?.details || JSON.stringify(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !editingProduct) return;

    setSubmitting(true);
    try {
      const finalPrice = pricingModel === 'Individually' ? Number(price || 0) : (bundles[0]?.price || 100);
      const categoryStr = selectedTags.length > 0 ? selectedTags.join(', ') : 'Treatment';

      if (clinicId) {
        await updateTreatment(editingProduct.id, {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          category: categoryStr,
          price: finalPrice,
          duration: duration ? `${duration} mins` : '30 mins',
          description,
          image: treatmentImage || editingProduct.photoUrl || '/images/default-treatment.jpg',
          scheduling_link: schedulingUrl,
          tags: selectedTags,
          service_unit_type: serviceUnitType === 'Select unit type' ? 'Treatment' : serviceUnitType,
          pricing_type: pricingModel,
          pricing_data: pricingModel === 'In Bundles' ? bundles : pricingModel === 'In Variations' ? variations : null,
          after_instructions: afterInstructions,
          before_instructions: beforeInstructions,
          requires_consultation: consultationWarning,
          restrict_cash_balance: cashBalanceExclusion,
          is_hidden: hideFromShop,
          client_results: clientTestimonial || clientResultPhoto ? [{ photoUrl: clientResultPhoto, testimonial: clientTestimonial }] : [],
        });
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name,
                durationMinutes: Number(duration) || 0,
                description,
                schedulingUrl,
                tags: selectedTags.length > 0 ? selectedTags : p.tags,
                serviceUnitType: serviceUnitType === 'Select unit type' ? 'Treatment' : serviceUnitType,
                pricingModel,
                price: finalPrice,
                maxQuantity: Number(maxQuantity) || 1,
                photoUrl: treatmentImage || p.photoUrl,
                afterInstructions,
                beforeInstructions,
                requiresConsultation: consultationWarning,
                excludeCashBalance: cashBalanceExclusion,
                hiddenFromShop: hideFromShop,
                clientResults: clientTestimonial || clientResultPhoto ? [{ photoUrl: clientResultPhoto, testimonial: clientTestimonial }] : p.clientResults,
              }
            : p
        )
      );

      resetForm();
      setOpenDrawer(false);
    } catch (err: any) {
      console.error('Failed to update treatment in Supabase:', err);
      alert('Could not update in Supabase: ' + (err?.message || err?.details || JSON.stringify(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      if (clinicId) {
        await deleteTreatment(productId);
      }
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Failed to delete treatment:', err);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Products Section Header matching Screenshot */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Products</h2>

        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3.5 py-2 bg-white shadow-2xs w-60">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="text-xs bg-transparent focus:outline-none w-full placeholder:text-slate-400"
            />
            <Search size={14} className="text-slate-400 flex-shrink-0" />
          </div>

          {/* Create Button */}
          <button
            onClick={openCreateDrawer}
            className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-xs shadow-pink-200 transition-all hover:shadow-md cursor-pointer"
          >
            <Plus size={15} />
            <span>Create a new product</span>
          </button>
        </div>
      </div>

      {treatmentsLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100">
          <Loader2 size={32} className="animate-spin text-pink-500 mb-2" />
          <p className="text-xs text-slate-400">Loading live treatments from Supabase...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Create your clinic treatments, sessions, or product bundles to offer in the mobile app."
          action={{
            label: "Create product",
            onClick: openCreateDrawer,
          }}
        />
      ) : (
        /* 4-column Grid exactly matching the user's photo */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group relative"
            >
              <div>
                {/* Image on top: wide aspect ratio with 3-dots button */}
                <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                  {p.photoUrl ? (
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-pink-400">
                      <Sparkles size={28} />
                    </div>
                  )}

                  {/* Three-dots menu trigger button matching photo */}
                  <button
                    data-dropdown-trigger
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === p.id ? null : p.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 backdrop-blur-xs"
                    title="Options"
                  >
                    <MoreVertical size={15} />
                  </button>

                  {/* Dropdown Menu matching Card 3 in photo */}
                  {menuOpenId === p.id && (
                    <div
                      data-dropdown-menu
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2.5 top-11 z-30 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-[140px] text-xs animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          openEditDrawer(p);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                      >
                        <Pencil size={13} className="text-slate-500" />
                        <span className="font-medium text-slate-800">Edit product</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          handleDeleteProduct(p.id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors text-left cursor-pointer"
                      >
                        <Trash2 size={13} className="text-slate-500 hover:text-rose-600" />
                        <span className="font-medium">Delete product</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Content below image */}
                <div className="p-4">
                  {/* Category Pill */}
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm inline-block self-start mb-2">
                    Treatment
                  </span>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-sm leading-snug tracking-tight mb-1 line-clamp-1">
                    {p.name}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {p.description || 'Medical-grade aesthetic procedure with tailored consultation.'}
                  </p>

                  {/* Tags */}
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {p.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5 bg-white font-normal"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Row matching photo: "From £90" */}
              <div className="px-4 pb-4 pt-1">
                <p className="text-xs text-slate-400 font-normal">
                  From <span className="font-semibold text-slate-800">£{p.price}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SlideOverDrawer matching Photo 1 & Photo 2 Exactly */}
      <SlideOverDrawer
        isOpen={openDrawer}
        onClose={closeDrawer}
        title={isEditMode ? 'Edit product' : 'Create a product'}
        maxWidth="max-w-[540px]"
        footer={
          <>
            <button
              type="button"
              onClick={closeDrawer}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={isEditMode ? 'edit-product-form' : 'create-product-form'}
              disabled={submitting}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>
                {submitting
                  ? isEditMode
                    ? 'Saving changes...'
                    : 'Saving...'
                  : isEditMode
                    ? 'Save changes'
                    : 'Create Product'}
              </span>
            </button>
          </>
        }
      >
        <form
          id={isEditMode ? 'edit-product-form' : 'create-product-form'}
          onSubmit={isEditMode ? handleUpdateProduct : handleCreateProduct}
          className="space-y-6 text-sm pb-6"
        >
          {/* Section 1: Basic informations (Matching Photo 1) */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Basic informations</h4>

            {/* Product name & Duration in a 2-col row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Product name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Treatment Duration (optional)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={0}
                    value={duration === '' ? '' : duration}
                    onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm"
                  />
                  <span className="absolute right-3.5 text-sm text-slate-400 pointer-events-none">
                    minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Product description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Product description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm resize-none"
              />
            </div>

            {/* Scheduling link (optional) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Scheduling link (optional)</label>
              <input
                type="text"
                value={schedulingUrl}
                onChange={(e) => setSchedulingUrl(e.target.value)}
                placeholder="Scheduling link"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm"
              />
            </div>

            {/* Who is this treatment with? (Populated dynamically from team_members) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Who is this treatment with?</label>
              <select
                value={selectedPractitionerId}
                onChange={(e) => setSelectedPractitionerId(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm cursor-pointer"
              >
                <option value="">Any Available Specialist</option>
                {teamMembers.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} — {m.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag(s) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Tag(s)</label>
              <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} />
            </div>

            {/* Service unit type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Service unit type</label>
              <select
                value={serviceUnitType}
                onChange={(e) => setServiceUnitType(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm"
              >
                {SERVICE_UNIT_TYPES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Pricing Section (Matching Photo 1) */}
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-semibold text-slate-700">Pricing</label>
              <div className="flex bg-slate-100/90 p-1 rounded-xl shadow-inner">
                {(['Individually', 'In Bundles', 'In Variations'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPricingModel(m)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                      pricingModel === m
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {pricingModel === 'Individually' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Price</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        value={price === '' ? '' : price}
                        onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm"
                      />
                      <span className="absolute right-3.5 text-sm text-slate-400 font-medium pointer-events-none">
                        $
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Max quantity</label>
                    <input
                      type="number"
                      min={0}
                      value={maxQuantity === '' ? '' : maxQuantity}
                      onChange={(e) => setMaxQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm"
                    />
                  </div>
                </div>
              )}

              {pricingModel === 'In Bundles' && (
                <div className="space-y-2 pt-2">
                  {bundles.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={b.quantity}
                        onChange={(e) => {
                          const next = [...bundles];
                          next[idx].quantity = Number(e.target.value);
                          setBundles(next);
                        }}
                        className="w-20 px-3 py-2.5 rounded-xl border border-slate-200 text-sm shadow-sm"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={b.price}
                        onChange={(e) => {
                          const next = [...bundles];
                          next[idx].price = Number(e.target.value);
                          setBundles(next);
                        }}
                        className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setBundles(bundles.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBundles([...bundles, { quantity: 1, price: 100 }])}
                    className="text-xs font-semibold text-pink-600 hover:text-pink-700 py-1 cursor-pointer"
                  >
                    + Add bundle price
                  </button>
                </div>
              )}

              {pricingModel === 'In Variations' && (
                <div className="space-y-2 pt-2">
                  {variations.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Variation Name"
                        value={v.name}
                        onChange={(e) => {
                          const next = [...variations];
                          next[idx].name = e.target.value;
                          setVariations(next);
                        }}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm shadow-sm"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => {
                          const next = [...variations];
                          next[idx].price = Number(e.target.value);
                          setVariations(next);
                        }}
                        className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setVariations(variations.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setVariations([...variations, { name: '', price: 100 }])}
                    className="text-xs font-semibold text-pink-600 hover:text-pink-700 py-1 cursor-pointer"
                  >
                    + Add product variation price
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Cover Image Upload (Uploaded directly to treatment-media) */}
          <div className="border-t border-slate-100 pt-5 space-y-2">
            <ImageUploadDropzone
              label="Product Cover Image (800x400px)"
              helperText="Uploaded to Supabase treatment-media bucket"
              aspectRatio="banner"
              currentImage={treatmentImage}
              onImageChange={setTreatmentImage}
              storageFolder="treatments"
            />
          </div>

          {/* Section 2: Before & After treatments instructions */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Before treatments instructions</label>
              <textarea
                rows={5}
                value={beforeInstructions}
                onChange={(e) => setBeforeInstructions(e.target.value)}
                placeholder="Before treatments instructions"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">After treatments instructions</label>
              <textarea
                rows={5}
                value={afterInstructions}
                onChange={(e) => setAfterInstructions(e.target.value)}
                placeholder="After treatments instructions"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm resize-none"
              />
            </div>
          </div>

          {/* Section 3: Client results (optional) (Matching Photo 2) */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Client results (optional)</h4>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm bg-white"
              >
                <PlusCircle size={14} className="text-slate-500" />
                <span>Add client result</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Before / After photo</label>
                <div
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (ev: any) => {
                      const file = ev.target.files?.[0];
                      if (file) {
                        setClientResultPhoto(URL.createObjectURL(file));
                      }
                    };
                    input.click();
                  }}
                  className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/40 hover:bg-slate-50 transition-colors cursor-pointer text-center min-h-[120px] relative overflow-hidden group shadow-sm"
                >
                  {clientResultPhoto ? (
                    <img src={clientResultPhoto} alt="Result" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-1.5 shadow-sm">
                        <UploadCloud size={17} />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 leading-tight">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">PNG or JPG (max. 1920x1080px)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Testimonial</label>
                <textarea
                  rows={4}
                  value={clientTestimonial}
                  onChange={(e) => setClientTestimonial(e.target.value)}
                  placeholder="Testimonial"
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm resize-none h-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Consultation & Payment options (Matching Photo 2 with iOS Switch) */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-800">
              Consultation & Payment options
            </h4>

            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-sm text-slate-700 font-medium">
                This treatment requires a consultation warning pop-up
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consultationWarning}
                  onChange={(e) => setConsultationWarning(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-sm text-slate-700 font-medium">
                Cash balance cannot be used on this product
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cashBalanceExclusion}
                  onChange={(e) => setCashBalanceExclusion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* Section 5: Other options (Matching Photo 2 accordion) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setOtherOptionsOpen(!otherOptionsOpen)}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
              >
                <span>Other options</span>
                {otherOptionsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {otherOptionsOpen && (
                <div className="mt-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm text-slate-700 font-medium">Hide this product from shop</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hideFromShop}
                        onChange={(e) => setHideFromShop(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </SlideOverDrawer>
    </div>
  );
}
