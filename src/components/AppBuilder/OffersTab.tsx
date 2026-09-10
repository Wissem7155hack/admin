import React, { useState, useEffect, useCallback } from 'react';
import { MoreVertical, Plus, Globe, Sparkles } from 'lucide-react';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import IPhoneLockScreen from '../common/IPhoneLockScreen';
import { AutomatedOffer, OneTimeOffer } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { handleImageError } from '../../hooks/useSupabaseData';

const SUPABASE_STORAGE_URL = 'https://jndcmymcnivessmvzpzc.supabase.co/storage/v1/object/public/offer-media/automated';

const INITIAL_AUTOMATED_OFFERS: AutomatedOffer[] = [
  {
    id: 'new-years',
    occasion: 'New Years',
    subtitle: 'Start the new year with a fresh look!',
    dateWindow: 'Jan 1 - 4, 6:00 AM',
    bannerTitle: 'HAPPY NEW YEAR 2025',
    bannerImage: `${SUPABASE_STORAGE_URL}/new_years.webp`,
    active: true,
    discountMode: 'Percentage',
    discountValue: 15,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
  {
    id: 'christmas',
    occasion: 'Christmas',
    subtitle: 'Festive season glowing specials!',
    dateWindow: 'Dec 20 - 26, 6:00 AM',
    bannerTitle: 'MERRY CHRISTMAS',
    bannerImage: `${SUPABASE_STORAGE_URL}/christmas.webp`,
    active: true,
    discountMode: 'Percentage',
    discountValue: 20,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
  {
    id: 'valentines',
    occasion: "St. Valentine's Day",
    subtitle: "Love your skin this Valentine's Day",
    dateWindow: 'Feb 10 - 15, 6:00 AM',
    bannerTitle: "VALENTINE'S SPECIAL",
    bannerImage: `${SUPABASE_STORAGE_URL}/valentines.webp`,
    active: true,
    discountMode: 'Percentage',
    discountValue: 10,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
  {
    id: 'easter',
    occasion: 'Easter Special',
    subtitle: 'Spring into fresh skin & wellness',
    dateWindow: 'Apr 10 - 15, 6:00 AM',
    bannerTitle: 'EASTER SPECIAL',
    bannerImage: `${SUPABASE_STORAGE_URL}/easter.webp`,
    active: true,
    discountMode: 'Percentage',
    discountValue: 15,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
  {
    id: 'halloween',
    occasion: 'Halloween',
    subtitle: 'Spooktacular beauty perks & treats',
    dateWindow: 'Oct 28 - 31, 6:00 AM',
    bannerTitle: 'HALLOWEEN GLOW',
    bannerImage: `${SUPABASE_STORAGE_URL}/halloween.webp`,
    active: true,
    discountMode: 'Percentage',
    discountValue: 10,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
  {
    id: 'birthday',
    occasion: 'Birthday Special',
    subtitle: 'A special birthday gift for your glow',
    dateWindow: 'Sent on client birthday',
    bannerTitle: 'HAPPY BIRTHDAY',
    bannerImage: `${SUPABASE_STORAGE_URL}/birthday_special.png`,
    active: true,
    discountMode: 'Percentage',
    discountValue: 25,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
  {
    id: 'anniversary',
    occasion: 'Client Anniversary',
    subtitle: 'Celebrating 1 year with us!',
    dateWindow: 'Sent on client 1-year anniversary',
    bannerTitle: 'ANNIVERSARY GIFT',
    bannerImage: `${SUPABASE_STORAGE_URL}/client_anniversary.webp`,
    active: true,
    discountMode: 'Percentage',
    discountValue: 20,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
  {
    id: 'st-patricks',
    occasion: "St. Patrick's Day",
    subtitle: 'Your lucky charm for radiant skin',
    dateWindow: 'Mar 15 - 18, 6:00 AM',
    bannerTitle: "LUCKY BEAUTY",
    bannerImage: `${SUPABASE_STORAGE_URL}/st_patricks.webp`,
    active: true,
    discountMode: 'Percentage',
    discountValue: 15,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
  {
    id: 'black-friday',
    occasion: 'Black Friday',
    subtitle: 'Our biggest savings of the entire year',
    dateWindow: 'Nov 24 - 30, 6:00 AM',
    bannerTitle: 'BLACK FRIDAY VIP',
    bannerImage: `${SUPABASE_STORAGE_URL}/black_friday.webp`,
    active: true,
    discountMode: 'Percentage',
    discountValue: 30,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
];

interface OffersTabProps {
  clinicId?: string;
}

export default function OffersTab({ clinicId }: OffersTabProps) {
  const [offersMode, setOffersMode] = useState<'One-Time offers' | 'Automated Offers'>('Automated Offers');
  const [automatedOffers, setAutomatedOffers] = useState<AutomatedOffer[]>(INITIAL_AUTOMATED_OFFERS);
  const [selectedOffer, setSelectedOffer] = useState<AutomatedOffer>(INITIAL_AUTOMATED_OFFERS[0]);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Edit automated offer states
  const [editActive, setEditActive] = useState(false);
  const [editDiscountMode, setEditDiscountMode] = useState<'Percentage' | 'Set $ amount'>('Percentage');
  const [editDiscountVal, setEditDiscountVal] = useState(15);
  const [editIncludeCart, setEditIncludeCart] = useState(true);
  const [editIncludeSimilar, setEditIncludeSimilar] = useState(true);

  // One-time offers
  const [oneTimeOffers, setOneTimeOffers] = useState<OneTimeOffer[]>([]);
  const [openOneTimeDrawer, setOpenOneTimeDrawer] = useState(false);

  // One-time offer form fields
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Private');
  const [startDate] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [offerMsg, setOfferMsg] = useState('');
  const [offerHeadline, setOfferHeadline] = useState('');
  const [bannerColor] = useState('#EC4899');
  const [discountType, setDiscountType] = useState<'Percentage' | 'Set $ amount'>('Percentage');
  const [discountVal, setDiscountVal] = useState(0);
  const [productScope] = useState<'Includes' | 'Excludes'>('Includes');

  // Fetch offers from Supabase
  const loadOffers = useCallback(async () => {
    if (!clinicId) return;
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('clinic_id', clinicId);

      if (error) throw error;

      if (data && data.length > 0) {
        // Map automated offers from DB
        const dbAutomated = data
          .filter((o) => o.type === 'automated')
          .map((o) => ({
            id: o.id,
            occasion: o.occasion || 'Event',
            subtitle: o.subtitle || '',
            dateWindow: o.date_window || '',
            bannerTitle: o.banner_title || o.title || '',
            bannerImage: o.banner_image_url || o.preview_image_url || '',
            active: !!o.is_active,
            discountMode: (o.discount_type as any) || 'Percentage',
            discountValue: Number(o.discount_value) || 15,
            includeRecentCart: o.include_recent_cart !== false,
            includeSimilarBrowse: o.include_similar_browse !== false,
            targetMode: (o.target_mode as any) || 'Includes',
            targetProducts: o.target_products || [],
          }));

        if (dbAutomated.length > 0) {
          setAutomatedOffers(dbAutomated);
          setSelectedOffer(dbAutomated[0]);
        }

        // Map one-time offers
        const dbOneTime = data
          .filter((o) => o.type === 'one_time')
          .map((o) => ({
            id: o.id,
            visibility: (o.visibility as any) || 'Private',
            startDate: o.start_date ? o.start_date.split('T')[0] : '',
            expiresInDays: 7,
            headline: o.title || 'Special Promotion',
            message: o.subtitle || '',
            bannerBgColor: '#EC4899',
            discountMode: (o.discount_type as any) || 'Percentage',
            discountValue: Number(o.discount_value) || 0,
            targetMode: (o.target_mode as any) || 'Includes',
            targetProducts: o.target_products || [],
          }));
        setOneTimeOffers(dbOneTime);
      }
    } catch (err) {
      console.warn('Could not fetch offers from Supabase, using defaults:', err);
    } finally {
    }
  }, [clinicId]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleOpenEdit = (offer: AutomatedOffer) => {
    setSelectedOffer(offer);
    setEditActive(offer.active);
    setEditDiscountMode(offer.discountMode);
    setEditDiscountVal(offer.discountValue);
    setEditIncludeCart(offer.includeRecentCart);
    setEditIncludeSimilar(offer.includeSimilarBrowse);
    setEditDrawerOpen(true);
  };

  const handleToggleActiveDirect = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = automatedOffers.find((o) => o.id === id);
    if (!target) return;
    const nextState = !target.active;

    // Optimistic update
    setAutomatedOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, active: nextState } : o))
    );
    if (selectedOffer.id === id) {
      setSelectedOffer((prev) => ({ ...prev, active: nextState }));
    }

    // Sync to Supabase
    try {
      await supabase
        .from('offers')
        .update({ is_active: nextState, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (err) {
      console.warn('Failed to sync offer status to Supabase:', err);
    }
  };

  const handleSaveAutomated = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedOffer: Partial<AutomatedOffer> = {
      active: editActive,
      discountMode: editDiscountMode,
      discountValue: editDiscountVal,
      includeRecentCart: editIncludeCart,
      includeSimilarBrowse: editIncludeSimilar,
    };

    setAutomatedOffers((prev) =>
      prev.map((o) => (o.id === selectedOffer.id ? { ...o, ...updatedOffer } : o))
    );
    setSelectedOffer((prev) => ({ ...prev, ...updatedOffer }));
    setEditDrawerOpen(false);

    // Sync to Supabase
    try {
      await supabase
        .from('offers')
        .update({
          is_active: editActive,
          discount_type: editDiscountMode,
          discount_value: editDiscountVal,
          include_recent_cart: editIncludeCart,
          include_similar_browse: editIncludeSimilar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedOffer.id);
    } catch (err) {
      console.warn('Failed to update offer in Supabase:', err);
    }
  };

  const handleCreateOneTime = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = 'oto-' + Date.now();
    const newOffer: OneTimeOffer = {
      id: tempId,
      visibility,
      startDate: startDate || new Date().toISOString().split('T')[0],
      expiresInDays: expiresIn || 7,
      headline: offerHeadline || 'Special Offer',
      message: offerMsg,
      bannerBgColor: bannerColor,
      discountMode: discountType,
      discountValue: discountVal,
      targetMode: productScope,
      targetProducts: [],
    };

    setOneTimeOffers([newOffer, ...oneTimeOffers]);
    setOpenOneTimeDrawer(false);

    // Persist to Supabase if clinicId is present
    if (clinicId) {
      try {
        const { data } = await supabase
          .from('offers')
          .insert([
            {
              clinic_id: clinicId,
              type: 'one_time',
              title: newOffer.headline,
              subtitle: newOffer.message,
              visibility: newOffer.visibility,
              start_date: newOffer.startDate,
              discount_type: newOffer.discountMode,
              discount_value: newOffer.discountValue,
              target_mode: newOffer.targetMode,
              is_active: true,
            },
          ])
          .select();
        if (data && data[0]) {
          setOneTimeOffers((prev) =>
            prev.map((o) => (o.id === tempId ? { ...o, id: data[0].id } : o))
          );
        }
      } catch (err) {
        console.warn('Failed to insert one-time offer to Supabase:', err);
      }
    }

    // Reset
    setOfferMsg('');
    setOfferHeadline('');
    setExpiresIn(0);
    setDiscountVal(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-tab Switcher matching Photo 3 */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {(['One-Time offers', 'Automated Offers'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setOffersMode(mode)}
              className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all ${
                offersMode === mode
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {offersMode === 'One-Time offers' && (
          <button
            onClick={() => setOpenOneTimeDrawer(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
          >
            <Plus size={16} />
            <span>Create one-time offer</span>
          </button>
        )}
      </div>

      {/* AUTOMATED OFFERS VIEW (Exact Match to Photo 3) */}
      {offersMode === 'Automated Offers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Phone Simulation & Notification (Approx 4 cols / 360px) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Notification Preview Card */}
            <div className="w-full max-w-[320px] bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                <Globe size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {selectedOffer.occasion === 'New Years' ? 'New Year, New YOU!' : selectedOffer.bannerTitle}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  We've made you a special gift... Tap to open!
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Preview</span>

            {/* Smartphone Frame with iPhone CSS */}
            <IPhoneLockScreen className="my-2">
              <div className="w-full h-full bg-white flex flex-col pt-8 px-3.5 pb-4">
                <div className="text-center my-2">
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    {selectedOffer.occasion === 'New Years' ? 'New Year, new YOU!' : selectedOffer.bannerTitle}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                    {selectedOffer.subtitle}
                  </p>
                </div>

                {/* Offer Image Card inside phone */}
                <div className="mt-1 rounded-xl overflow-hidden shadow-xs border border-slate-100 bg-slate-900 aspect-[4/3] relative flex-shrink-0">
                  <img
                    src={selectedOffer.bannerImage}
                    alt={selectedOffer.occasion}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    onError={handleImageError}
                  />
                </div>
              </div>
            </IPhoneLockScreen>
          </div>

          {/* Right Column: Occasions Table (8 cols matching Photo 3) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_100px_40px] px-6 py-3.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <div>Occasion</div>
              <div>Content</div>
              <div></div>
              <div></div>
            </div>

            {/* Occasion Rows */}
            <div className="divide-y divide-slate-100">
              {automatedOffers.map((offer) => {
                const isSelected = selectedOffer.id === offer.id;
                return (
                  <div
                    key={offer.id}
                    onClick={() => setSelectedOffer(offer)}
                    className={`grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_100px_40px] items-center px-6 py-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-pink-50/40 ring-1 ring-inset ring-pink-200'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Occasion Info */}
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={offer.bannerImage}
                        alt={offer.occasion}
                        className="w-10 h-8 rounded-lg object-cover bg-slate-900 flex-shrink-0 shadow-2xs border border-slate-200"
                        onError={handleImageError}
                      />
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {offer.occasion}
                      </span>
                    </div>

                    {/* Content / Discount */}
                    <div className="text-xs text-slate-500 font-medium">
                      {offer.active ? `${offer.discountValue}% Discount` : 'No Discount'}
                    </div>

                    {/* Status Pill */}
                    <div>
                      <button
                        type="button"
                        onClick={(e) => handleToggleActiveDirect(offer.id, e)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          offer.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50/70 text-rose-600 border-rose-200/80 hover:bg-rose-100/80'
                        }`}
                      >
                        <span>{offer.active ? '✓' : '×'}</span>
                        <span>{offer.active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </div>

                    {/* Three Dots Menu */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(offer);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ONE-TIME OFFERS VIEW */}
      {offersMode === 'One-Time offers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Phone Simulation Preview for One-Time Offer */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Notification Preview Card */}
            <div className="w-full max-w-[320px] bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0 text-pink-500">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {oneTimeOffers[0]?.headline || 'Flash Special Offer'}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {oneTimeOffers[0]?.message || 'Exclusive clinic discount available now!'}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Preview</span>

            {/* Smartphone Frame with iPhone Lock Screen */}
            <IPhoneLockScreen className="my-2">
              <div className="w-full h-full bg-white flex flex-col pt-8 px-3.5 pb-4">
                <div className="text-center my-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                    {oneTimeOffers[0]?.visibility || 'Special'} Discount
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight mt-1">
                    {oneTimeOffers[0]?.headline || 'Summer Flash Sale'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                    {oneTimeOffers[0]?.message || 'Enjoy limited-time discount on top treatments.'}
                  </p>
                </div>

                <div
                  className="mt-2 rounded-2xl p-4 text-white flex flex-col justify-between aspect-[16/10] relative shadow-xs"
                  style={{ backgroundColor: oneTimeOffers[0]?.bannerBgColor || '#EC4899' }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold bg-black/20 px-2 py-0.5 rounded uppercase">
                      {oneTimeOffers[0]?.discountMode === 'Percentage' ? `${oneTimeOffers[0]?.discountValue}% OFF` : `$${oneTimeOffers[0]?.discountValue} OFF`}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black">{oneTimeOffers[0]?.headline || 'Limited Promotion'}</p>
                    <p className="text-[9px] text-white/80 mt-0.5">Expires in {oneTimeOffers[0]?.expiresInDays || 3} days</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full py-2 bg-pink-500 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Claim Offer Now
                </button>
              </div>
            </IPhoneLockScreen>
          </div>

          {/* Right Column: One-time Offers Cards */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            {oneTimeOffers.length === 0 ? (
              <EmptyState
                title="No one-time offers created"
                description="Launch flash discounts and limited-window promotions to boost clinic bookings."
                action={{
                  label: '+ Create one-time offer',
                  onClick: () => setOpenOneTimeDrawer(true),
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {oneTimeOffers.map((oto) => (
                  <div key={oto.id} className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white hover:shadow-md transition-all">
                    <div
                      className="p-4 text-white flex items-center justify-between"
                      style={{ backgroundColor: oto.bannerBgColor }}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
                          {oto.visibility}
                        </span>
                        <h4 className="text-sm font-bold mt-1">{oto.headline}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black">{oto.discountValue}% OFF</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-slate-600 line-clamp-2">{oto.message || 'Limited-time clinic special promotion.'}</p>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Starts {oto.startDate || 'Now'}</span>
                        <span>Expires in {oto.expiresInDays}d</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT AUTOMATED OFFER DRAWER */}
      <SlideOverDrawer
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        title={selectedOffer.occasion}
        maxWidth="max-w-[460px]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditDrawerOpen(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAutomated}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
            >
              Save offer
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAutomated} className="space-y-6 text-xs">
          {/* Active Switch */}
          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div>
              <p className="font-semibold text-slate-900">Offer Status</p>
              <p className="text-[11px] text-slate-500">Enable this automated holiday campaign</p>
            </div>
            <button
              type="button"
              onClick={() => setEditActive(!editActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                editActive ? 'bg-pink-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  editActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Discount Mode */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Discount Type</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              {(['Percentage', 'Set $ amount'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setEditDiscountMode(m)}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    editDiscountMode === m
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Discount Amount</label>
            <div className="relative">
              <input
                type="number"
                value={editDiscountVal}
                onChange={(e) => setEditDiscountVal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                {editDiscountMode === 'Percentage' ? '%' : '$'}
              </span>
            </div>
          </div>

          {/* Targeting Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editIncludeCart}
                onChange={(e) => setEditIncludeCart(e.target.checked)}
                className="rounded text-pink-500 focus:ring-pink-500/20"
              />
              <span className="text-xs text-slate-700 font-medium">Include items recently left in cart</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editIncludeSimilar}
                onChange={(e) => setEditIncludeSimilar(e.target.checked)}
                className="rounded text-pink-500 focus:ring-pink-500/20"
              />
              <span className="text-xs text-slate-700 font-medium">Include similar browse recommendations</span>
            </label>
          </div>
        </form>
      </SlideOverDrawer>

      {/* CREATE ONE-TIME OFFER DRAWER */}
      <SlideOverDrawer
        isOpen={openOneTimeDrawer}
        onClose={() => setOpenOneTimeDrawer(false)}
        title="Create one-time offer"
        maxWidth="max-w-[480px]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenOneTimeDrawer(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateOneTime}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
            >
              Publish offer
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateOneTime} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Visibility</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              {(['Private', 'Public'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    visibility === v
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              required
              value={offerHeadline}
              onChange={(e) => setOfferHeadline(e.target.value)}
              placeholder="e.g. Flash Summer Glow Discount"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Offer Message</label>
            <textarea
              rows={3}
              value={offerMsg}
              onChange={(e) => setOfferMsg(e.target.value)}
              placeholder="Exclusive 20% off all HydraFacial sessions this weekend only..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Discount Mode</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Set $ amount">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Value</label>
              <input
                type="number"
                min={1}
                value={discountVal}
                onChange={(e) => setDiscountVal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>
        </form>
      </SlideOverDrawer>
    </div>
  );
}
