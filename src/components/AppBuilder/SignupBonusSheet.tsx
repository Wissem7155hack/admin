import React, { useState } from 'react';
import { Search, Check, ChevronDown } from 'lucide-react';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { SignupBonus } from '../../types';

interface Props {
  onClose: () => void;
  onSave: (bonus: SignupBonus) => void;
}

const AVAILABILITY = ['In-app', 'In-Office'] as const;
const DISCOUNT_TYPES = ['Percentage', 'Set $ amount', 'Free service'] as const;
const PRODUCT_FILTER = ['Includes', 'Excludes'] as const;

const MOCK_PRODUCTS = [
  'Hydra Facial',
  'LED Light Session',
  'Vitamin C Serum',
  'Microdermabrasion',
  'Skin Consultation',
  'Anti-Aging Package',
];

export default function SignupBonusSheet({ onClose, onSave }: Props) {
  const [availability, setAvailability] = useState<(typeof AVAILABILITY)[number]>('In-Office');
  const [discountType, setDiscountType] = useState<(typeof DISCOUNT_TYPES)[number]>('Free service');
  const [productFilter, setProductFilter] = useState<(typeof PRODUCT_FILTER)[number]>('Includes');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState(0);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const shownProducts = MOCK_PRODUCTS.filter((product) =>
    product.toLowerCase().includes(productSearch.toLowerCase())
  );

  function toggleProduct(prod: string) {
    setSelectedProducts((prev) =>
      prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod]
    );
  }

  function handleSave() {
    onSave({
      id: Date.now().toString(),
      availability,
      discountType,
      productFilter,
      description: description.trim(),
      value,
      products: selectedProducts,
    });
  }

  return (
    <SlideOverDrawer
      isOpen={true}
      onClose={onClose}
      title="Add a signup bonus"
      maxWidth="max-w-lg"
      showCloseX={true}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
          >
            Add signup bonus
          </button>
        </>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Description */}
        <section className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Signup bonus description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Signup bonus description"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 placeholder:text-gray-400 resize-none"
          />
        </section>

        {/* Availability */}
        <section className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Availability</label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABILITY.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setAvailability(item)}
                className={`border rounded-xl py-2.5 px-3 text-xs font-medium transition-colors ${
                  availability === item
                    ? 'border-pink-500 bg-pink-50/50 text-pink-600 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Discount type */}
        <section className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Discount type</label>
          <div className="grid grid-cols-3 gap-2">
            {DISCOUNT_TYPES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDiscountType(item)}
                className={`border rounded-xl py-2.5 px-3 text-xs font-medium transition-colors ${
                  discountType === item
                    ? 'border-pink-500 bg-pink-50/50 text-pink-600 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {discountType !== 'Free service' && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {discountType === 'Percentage' ? 'Discount percentage' : 'Discount amount ($)'}
              </label>
              <input
                type="number"
                value={value === 0 ? '' : value}
                onChange={(event) => setValue(Number(event.target.value))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
              />
            </div>
          )}
        </section>

        {/* Product filter */}
        <section className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Product(s)</label>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_FILTER.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setProductFilter(item)}
                className={`border rounded-xl py-2.5 px-3 text-xs font-medium transition-colors ${
                  productFilter === item
                    ? 'border-pink-500 bg-pink-50/50 text-pink-600 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="relative pt-2">
            <button
              type="button"
              onClick={() => setProductPickerOpen(!productPickerOpen)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between text-gray-700"
            >
              <span>{selectedProducts.length ? `${selectedProducts.length} selected` : 'Select products'}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {productPickerOpen && (
              <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg p-3 space-y-2">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2.5 py-1.5">
                  <Search size={14} className="text-gray-400" />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product..."
                    className="w-full text-xs outline-none"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-gray-100">
                  {shownProducts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleProduct(p)}
                      className="w-full text-left py-2 px-1 flex items-center justify-between hover:bg-gray-50 text-xs text-gray-700"
                    >
                      <span>{p}</span>
                      {selectedProducts.includes(p) && <Check size={14} className="text-pink-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </SlideOverDrawer>
  );
}
