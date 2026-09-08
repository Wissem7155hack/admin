import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Loader2,
  Pencil,
} from 'lucide-react';
import TagSelector from './TagSelector';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import ImageUploadDropzone from '../common/ImageUploadDropzone';
import { Product } from '../../types';
import { useTreatments, TreatmentRecord } from '../../hooks/useSupabaseData';

const SERVICE_UNIT_TYPES = [
  'Select unit type',
  'Treatment',
  'Session',
  'Unit',
  'Syringe',
  'Vial',
  'Package',
  'Area'
];

interface ProductsTabProps {
  clinicId?: string;
  clinicName?: string;
}

export default function ProductsTab({ clinicId, clinicName = 'Clinic' }: ProductsTabProps) {
  const {
    treatments: supabaseTreatments,
    loading: treatmentsLoading,
    addTreatment,
    updateTreatment,
    deleteTreatment,
  } = useTreatments(clinicId);

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = editingProduct !== null;

  // Opens the drawer in edit mode with the form pre-filled from an existing treatment
  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDuration(product.durationMinutes || 30);
    setDescription(product.description || '');
    setSchedulingUrl(product.schedulingUrl || '');
    setSelectedTags(product.tags || []);
    setServiceUnitType(product.serviceUnitType || 'Treatment');
    setPricingModel(product.pricingModel || 'Individually');
    setPrice(product.price ?? 120);
    setTreatmentImage(product.photoUrl || '');
    setMaxQuantity(product.maxQuantity ?? 1);
    setOpenDrawer(true);
  };

  // Opens the drawer in create mode with a clean form
  const openCreateDrawer = () => {
    setEditingProduct(null);
    setName('');
    setDuration(30);
    setDescription('');
    setSchedulingUrl('');
    setSelectedTags([]);
    setServiceUnitType('Treatment');
    setPricingModel('Individually');
    setPrice(120);
    setTreatmentImage('');
    setAfterInstructions('');
    setClientTestimonial('');
    setOpenDrawer(true);
  };

  // Form states
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState('');
  const [schedulingUrl, setSchedulingUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [serviceUnitType, setServiceUnitType] = useState('Treatment');
  const [pricingModel, setPricingModel] = useState<'Individually' | 'In Bundles' | 'In Variations'>('Individually');
  const [price, setPrice] = useState(120);
  const [treatmentImage, setTreatmentImage] = useState('');
  const [maxQuantity, setMaxQuantity] = useState(1);
  const [bundles] = useState<{ quantity: number; price: number }[]>([
    { quantity: 3, price: 300 },
    { quantity: 6, price: 550 },
  ]);
  const [variations] = useState<{ name: string; price: number }[]>([
    { name: 'Standard (Face)', price: 120 },
    { name: 'Intense (Face & Neck)', price: 180 },
  ]);
  const [afterInstructions, setAfterInstructions] = useState('');
  const [consultationWarning] = useState(false);
  const [cashBalanceExclusion] = useState(false);
  const [hideFromShop] = useState(false);
  const [clientTestimonial, setClientTestimonial] = useState('');
  void afterInstructions;
  void clientTestimonial;

  // Map Supabase treatments into local Product view
  useEffect(() => {
    if (supabaseTreatments && supabaseTreatments.length > 0) {
      const mapped: Product[] = supabaseTreatments.map((t: TreatmentRecord) => {
        const numPrice = typeof t.price === 'string' ? parseFloat(t.price) || 0 : t.price;
        const durMatch = t.duration ? parseInt(t.duration) : 30;
        return {
          id: t.id,
          name: t.name,
          durationMinutes: durMatch || 30,
          description: t.description || '',
          schedulingUrl: '',
          tags: t.category ? [t.category] : ['Aesthetics'],
          serviceUnitType: 'Treatment',
          pricingModel: 'Individually',
          price: numPrice,
          maxQuantity: 1,
          photoUrl: t.image,
          afterInstructions: '',
          requiresConsultation: false,
          excludeCashBalance: false,
          hiddenFromShop: false,
        };
      });
      setProducts(mapped);
    }
  }, [supabaseTreatments]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSchedulingUrl('');
    setDuration(30);
    setPrice(120);
    setTreatmentImage('');
    setAfterInstructions('');
    setClientTestimonial('');
    setSelectedTags([]);
    setServiceUnitType('Treatment');
    setPricingModel('Individually');
    setMaxQuantity(1);
    setEditingProduct(null);
  };

  // Closes the drawer, letting the slide-out animation finish before
  // clearing the form so the title/footer don't flicker mid-transition.
  const closeDrawer = () => {
    setOpenDrawer(false);
    setTimeout(resetForm, 320);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const finalPrice = pricingModel === 'Individually' ? price : (bundles[0]?.price || 100);
      const category = selectedTags[0] || (serviceUnitType !== 'Select unit type' ? serviceUnitType : 'Aesthetics');
      
      // Save directly to live Supabase database
      if (clinicId) {
        await addTreatment({
          clinic_id: clinicId,
          name,
          category,
          price: finalPrice,
          duration: `${duration || 30} mins`,
          description,
          image: treatmentImage || '/images/default-treatment.jpg',
          is_recommended: true,
          is_membership_only: false,
        });
      }

      // Optimistic local state update
      const newProduct: Product = {
        id: Date.now().toString(),
        name,
        durationMinutes: duration || 30,
        description,
        schedulingUrl,
        tags: selectedTags.length > 0 ? selectedTags : ['Aesthetics'],
        serviceUnitType: serviceUnitType === 'Select unit type' ? 'Treatment' : serviceUnitType,
        pricingModel,
        price: finalPrice,
        maxQuantity,
        photoUrl: treatmentImage,
        bundles: pricingModel === 'In Bundles' ? bundles : undefined,
        variations: pricingModel === 'In Variations' ? variations : undefined,
        afterInstructions,
        requiresConsultation: consultationWarning,
        excludeCashBalance: cashBalanceExclusion,
        hiddenFromShop: hideFromShop,
      };

      setProducts((prev) => [newProduct, ...prev]);

      // Reset form
      resetForm();
      setOpenDrawer(false);
    } catch (err) {
      console.error('Failed to create treatment in Supabase:', err);
      alert('Could not save to Supabase. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handles both create and edit submission; in edit mode it persists
  // the updated fields to Supabase and refreshes the local card list.
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !editingProduct) return;

    setSubmitting(true);
    try {
      const finalPrice = pricingModel === 'Individually' ? price : (bundles[0]?.price || 100);
      const category = selectedTags[0] || (serviceUnitType !== 'Select unit type' ? serviceUnitType : 'Aesthetics');

      if (clinicId) {
        await updateTreatment(editingProduct.id, {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          category,
          price: finalPrice,
          duration: `${duration || 30} mins`,
          description,
          image: treatmentImage || editingProduct.photoUrl || '/images/default-treatment.jpg',
        });
      }

      // Optimistic local state update so the card reflects changes immediately
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name,
                durationMinutes: duration || 30,
                description,
                schedulingUrl,
                tags: selectedTags.length > 0 ? selectedTags : ['Aesthetics'],
                serviceUnitType: serviceUnitType === 'Select unit type' ? 'Treatment' : serviceUnitType,
                pricingModel,
                price: finalPrice,
                maxQuantity,
                photoUrl: treatmentImage || p.photoUrl,
              }
            : p
        )
      );

      resetForm();
      setOpenDrawer(false);
    } catch (err) {
      console.error('Failed to update treatment in Supabase:', err);
      alert('Could not update in Supabase. Please check your connection.');
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Products & Treatments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Managing live treatments and services for <strong className="text-slate-800">{clinicName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2 bg-white shadow-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="text-sm bg-transparent focus:outline-none w-48 placeholder:text-slate-400"
            />
            <Search size={16} className="text-slate-700" />
          </div>

          <button
            onClick={openCreateDrawer}
            className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md cursor-pointer"
          >
            <Plus size={16} />
            <span>Create new product</span>
          </button>
        </div>
      </div>

      {treatmentsLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
          <Loader2 size={32} className="animate-spin text-pink-500 mb-2" />
          <p className="text-xs text-slate-500">Loading live treatments from Supabase...</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
                        <Sparkles size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                          ${p.price}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock size={12} /> {p.durationMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-all">
                    <button
                      onClick={() => openEditDrawer(p)}
                      className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                      title="Edit product"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {p.description || 'No description provided for this aesthetic procedure.'}
                </p>

                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Type: {p.serviceUnitType || 'Treatment'}</span>
                <span className="text-emerald-600 font-semibold">Active in App</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SlideOverDrawer matching Photo 1 & 2 */}
      <SlideOverDrawer
        isOpen={openDrawer}
        onClose={closeDrawer}
        title={isEditMode ? 'Edit product' : 'Create new product'}
        footer={
          <>
            <button
              type="button"
              onClick={closeDrawer}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={isEditMode ? 'edit-product-form' : 'create-product-form'}
              disabled={submitting}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md flex items-center gap-1.5"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>
                {submitting
                  ? isEditMode
                    ? 'Saving changes...'
                    : 'Saving to Supabase...'
                  : isEditMode
                    ? 'Save changes'
                    : 'Create product'}
              </span>
            </button>
          </>
        }
      >
        <form
          id={isEditMode ? 'edit-product-form' : 'create-product-form'}
          onSubmit={isEditMode ? handleUpdateProduct : handleCreateProduct}
          className="space-y-6 text-xs"
        >
          {/* Treatment Image Upload */}
          <ImageUploadDropzone
            label="Product / Treatment Cover Image"
            helperText="Uploaded to Supabase storage bucket"
            aspectRatio="banner"
            currentImage={treatmentImage}
            onImageChange={setTreatmentImage}
            storageFolder="treatments"
          />

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Product name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HydraFacial Platinum"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          {/* Duration in minutes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Duration in minutes</label>
            <input
              type="number"
              min={5}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="30"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Treatment details and benefits..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Category Tags</label>
            <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} />
          </div>

          {/* Unit Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Service unit type</label>
            <select
              value={serviceUnitType}
              onChange={(e) => setServiceUnitType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            >
              {SERVICE_UNIT_TYPES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Pricing Model Tabs */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <label className="block text-xs font-medium text-slate-700">How would you like to price this product?</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['Individually', 'In Bundles', 'In Variations'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPricingModel(m)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    pricingModel === m
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {pricingModel === 'Individually' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Max quantity per order</label>
                  <input
                    type="number"
                    min={1}
                    value={maxQuantity}
                    onChange={(e) => setMaxQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </SlideOverDrawer>
    </div>
  );
}
