import React, { useState } from 'react';
import { Search, Plus, Trash2, ChevronDown, ChevronUp, UploadCloud, PlusCircle } from 'lucide-react';
import TagSelector from './TagSelector';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { Product } from '../../types';

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

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);

  // Form states matching Photo 1 & 2
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(0);
  const [description, setDescription] = useState('');
  const [schedulingUrl, setSchedulingUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [serviceUnitType, setServiceUnitType] = useState('Select unit type');
  const [pricingModel, setPricingModel] = useState<'Individually' | 'In Bundles' | 'In Variations'>('Individually');
  const [price, setPrice] = useState(120);
  const [maxQuantity, setMaxQuantity] = useState(1);
  const [bundles, setBundles] = useState<{ quantity: number; price: number }[]>([
    { quantity: 3, price: 300 },
    { quantity: 6, price: 550 },
  ]);
  const [variations, setVariations] = useState<{ name: string; price: number }[]>([
    { name: 'Standard (Face)', price: 120 },
    { name: 'Intense (Face & Neck)', price: 180 },
  ]);
  const [afterInstructions, setAfterInstructions] = useState('');
  const [consultationWarning, setConsultationWarning] = useState(false);
  const [cashBalanceExclusion, setCashBalanceExclusion] = useState(false);
  const [otherOptionsOpen, setOtherOptionsOpen] = useState(false);
  const [hideFromShop, setHideFromShop] = useState(false);
  const [clientTestimonial, setClientTestimonial] = useState('');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      durationMinutes: duration || 30,
      description,
      schedulingUrl,
      tags: selectedTags,
      serviceUnitType: serviceUnitType === 'Select unit type' ? 'Treatment' : serviceUnitType,
      pricingModel,
      price: pricingModel === 'Individually' ? price : (bundles[0]?.price || 100),
      maxQuantity,
      bundles: pricingModel === 'In Bundles' ? bundles : undefined,
      variations: pricingModel === 'In Variations' ? variations : undefined,
      afterInstructions,
      requiresConsultation: consultationWarning,
      excludeCashBalance: cashBalanceExclusion,
      hiddenFromShop: hideFromShop,
    };
    setProducts([newProduct, ...products]);
    // Reset
    setName('');
    setDescription('');
    setSchedulingUrl('');
    setDuration(0);
    setAfterInstructions('');
    setClientTestimonial('');
    setOpenDrawer(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Products</h2>

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
            onClick={() => setOpenDrawer(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
          >
            <Plus size={16} />
            <span>Create a new product</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs min-h-[60vh] flex flex-col justify-center items-center p-8">
        {products.length === 0 ? (
          <EmptyState
            title="Create your first product!"
            description="Offer treatments, procedures, sessions, and retail skincare products directly through your mobile app."
            action={{
              label: '+ Create a new product',
              onClick: () => setOpenDrawer(true),
            }}
          />
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((prod) => (
              <div key={prod.id} className="p-5 rounded-2xl border border-slate-200/80 hover:border-pink-300 transition-all bg-white shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wide">
                      {prod.serviceUnitType}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{prod.name}</h3>
                    <span className="text-xs text-slate-400 font-medium">{prod.durationMinutes} min</span>
                  </div>
                  <span className="text-sm font-black text-pink-600">${prod.price}</span>
                </div>
                {prod.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>
                )}
                <div className="flex flex-wrap gap-1 pt-1">
                  {prod.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE PRODUCT DRAWER (Exact Match to Photo 1 & Photo 2!) */}
      <SlideOverDrawer
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title="Create a product"
        maxWidth="max-w-[520px]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenDrawer(false)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateProduct}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-medium shadow-sm shadow-pink-200 transition-all hover:shadow-md"
            >
              Create Product
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateProduct} className="space-y-6 text-xs">
          {/* Basic Informations */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800">
              Basic Informations
            </h3>

            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Product name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Treatment Duration (optional)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={duration === 0 ? '' : duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    minutes
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Product description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description"
                rows={4}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Scheduling link (optional)</label>
              <input
                type="url"
                value={schedulingUrl}
                onChange={(e) => setSchedulingUrl(e.target.value)}
                placeholder="Scheduling link"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            {/* Tag(s) */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tag(s)</label>
              <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} />
            </div>

            {/* Service unit type */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Service unit type</label>
              <div className="relative">
                <select
                  value={serviceUnitType}
                  onChange={(e) => setServiceUnitType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                >
                  {SERVICE_UNIT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 border-t border-slate-100 pt-5">
            <label className="block text-xs font-bold text-slate-800">
              Pricing
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['Individually', 'In Bundles', 'In Variations'] as const).map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setPricingModel(model)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${pricingModel === model
                    ? 'bg-white shadow-xs text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {model}
                </button>
              ))}
            </div>

            {pricingModel === 'Individually' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Max quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={maxQuantity}
                    onChange={(e) => setMaxQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>
            )}

            {pricingModel === 'In Bundles' && (
              <div className="space-y-2">
                {bundles.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="number"
                      value={b.quantity}
                      onChange={(e) => {
                        const next = [...bundles];
                        next[idx].quantity = Number(e.target.value);
                        setBundles(next);
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <input
                      type="number"
                      value={b.price}
                      onChange={(e) => {
                        const next = [...bundles];
                        next[idx].price = Number(e.target.value);
                        setBundles(next);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setBundles(bundles.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setBundles([...bundles, { quantity: 1, price: 100 }])}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 py-1"
                >
                  + Add more bundle pricing
                </button>
              </div>
            )}

            {pricingModel === 'In Variations' && (
              <div className="space-y-2">
                {variations.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => {
                        const next = [...variations];
                        next[idx].name = e.target.value;
                        setVariations(next);
                      }}
                      placeholder="e.g. Hands"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const next = [...variations];
                        next[idx].price = Number(e.target.value);
                        setVariations(next);
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setVariations(variations.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setVariations([...variations, { name: '', price: 100 }])}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 py-1"
                >
                  + Add product variation price
                </button>
              </div>
            )}
          </div>

          {/* After treatments instructions matching Photo 2 */}

          <div className="space-y-2 border-t border-slate-100 pt-5">
            <label className="block text-xs font-medium text-slate-700">Before treatments instructions</label>
            <textarea
              value={afterInstructions}
              onChange={(e) => setAfterInstructions(e.target.value)}
              placeholder="Before treatments instructions"
              rows={3}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none"
            />
          </div>


          <div className="space-y-2 border-t border-slate-100 pt-5">
            <label className="block text-xs font-medium text-slate-700">After treatments instructions</label>
            <textarea
              value={afterInstructions}
              onChange={(e) => setAfterInstructions(e.target.value)}
              placeholder="After treatments instructions"
              rows={3}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none"
            />
          </div>

          {/* Client results (optional) matching Photo 2 */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">Client results (optional)</h4>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <PlusCircle size={13} className="text-slate-500" />
                <span>Add client result</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Before / After photo</label>
                <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-center min-h-[110px]">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-1.5">
                    <UploadCloud size={16} />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 leading-tight">Click to upload or drag and drop</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PNG or JPG (max. 1920x1080px)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Testimonial</label>
                <textarea
                  rows={4}
                  value={clientTestimonial}
                  onChange={(e) => setClientTestimonial(e.target.value)}
                  placeholder="Testimonial"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none h-[110px]"
                />
              </div>
            </div>
          </div>

          {/* Consultation & Payment options matching Photo 2 with iOS Switch */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold text-slate-800">
              Consultation & Payment options
            </h4>

            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
              <span className="text-xs text-slate-700 font-medium">This treatment requires a consultation warning pop-up</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consultationWarning}
                  onChange={(e) => setConsultationWarning(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-800"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
              <span className="text-xs text-slate-700 font-medium">Cash balance cannot be used on this product</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cashBalanceExclusion}
                  onChange={(e) => setCashBalanceExclusion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-800"></div>
              </label>
            </div>

            {/* Other options accordion matching Photo 2 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setOtherOptionsOpen(!otherOptionsOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                <span>Other options</span>
                {otherOptionsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {otherOptionsOpen && (
                <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Hide from in-app shop catalog</span>
                    <input
                      type="checkbox"
                      checked={hideFromShop}
                      onChange={(e) => setHideFromShop(e.target.checked)}
                      className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 h-4 w-4"
                    />
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
