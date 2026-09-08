import React, { useState } from 'react';
import { Calendar, ChevronDown, MoreVertical, Plus, Sparkles, Volume2, Upload, Globe } from 'lucide-react';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { AutomatedOffer, OneTimeOffer } from '../../types';

const INITIAL_AUTOMATED_OFFERS: AutomatedOffer[] = [
  {
    id: 'new-years',
    occasion: 'New Years',
    subtitle: 'Start the new year with a fresh look!',
    dateWindow: 'Jan 1 - 4, 6:00 AM',
    bannerTitle: 'HAPPY NEW YEAR 2025',
    bannerImage: '/images/automated_offers2Fwebapp2Fnew_year.webp',
    active: false,
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
    bannerImage: '/images/automated_offers2Fwebapp2Fchristmas.webp',
    active: false,
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
    bannerImage: '/images/automated_offers2Fwebapp2Fvalentine.webp',
    active: false,
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
    bannerImage: '/images/automated_offers2Fwebapp2Feaster.webp',
    active: false,
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
    bannerImage: '/images/automated_offers2Fwebapp2Fhalloween.webp',
    active: false,
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
    bannerImage: '/images/happy birthday card.png',
    active: false,
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
    bannerImage: '/images/automated_offers2Fwebapp2F1st.webp',
    active: false,
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
    bannerImage: '/images/automated_offers2Fwebapp2Fpatrick.webp',
    active: false,
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
    bannerImage: '/images/automated_offers2Fwebapp2Fblack_friday.webp',
    active: false,
    discountMode: 'Percentage',
    discountValue: 30,
    includeRecentCart: true,
    includeSimilarBrowse: true,
    targetMode: 'Includes',
    targetProducts: [],
  },
];

export default function OffersTab() {
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

  // One-time offer form fields matching Photo 4 pixel-perfect
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Private');
  const [startDate, setStartDate] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [offerMsg, setOfferMsg] = useState('');
  const [offerHeadline, setOfferHeadline] = useState('');
  const [bannerColor, setBannerColor] = useState('#EC4899');
  const [discountType, setDiscountType] = useState<'Percentage' | 'Set $ amount'>('Percentage');
  const [discountVal, setDiscountVal] = useState(0);
  const [productScope, setProductScope] = useState<'Includes' | 'Excludes'>('Includes');

  const handleOpenEdit = (offer: AutomatedOffer) => {
    setSelectedOffer(offer);
    setEditActive(offer.active);
    setEditDiscountMode(offer.discountMode);
    setEditDiscountVal(offer.discountValue);
    setEditIncludeCart(offer.includeRecentCart);
    setEditIncludeSimilar(offer.includeSimilarBrowse);
    setEditDrawerOpen(true);
  };

  const handleToggleActiveDirect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAutomatedOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o))
    );
  };

  const handleSaveAutomated = (e: React.FormEvent) => {
    e.preventDefault();
    setAutomatedOffers((prev) =>
      prev.map((o) =>
        o.id === selectedOffer.id
          ? {
              ...o,
              active: editActive,
              discountMode: editDiscountMode,
              discountValue: editDiscountVal,
              includeRecentCart: editIncludeCart,
              includeSimilarBrowse: editIncludeSimilar,
            }
          : o
      )
    );
    setSelectedOffer((prev) => ({
      ...prev,
      active: editActive,
      discountMode: editDiscountMode,
      discountValue: editDiscountVal,
      includeRecentCart: editIncludeCart,
      includeSimilarBrowse: editIncludeSimilar,
    }));
    setEditDrawerOpen(false);
  };

  const handleCreateOneTime = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: OneTimeOffer = {
      id: 'oto-' + Date.now(),
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
                  {selectedOffer.id === 'new-years' ? 'New Year, New YOU!' : selectedOffer.bannerTitle}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  We've made you a special gift... Tap to open!
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Preview</span>

            {/* Smartphone Frame */}
            <div className="w-[270px] h-[520px] bg-[#1E293B] rounded-[42px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
              {/* Top Speaker/Camera notch */}
              <div className="w-24 h-4 bg-[#1E293B] rounded-b-xl mx-auto absolute top-3 left-1/2 -translate-x-1/2 z-20" />

              {/* Screen container */}
              <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col pt-8 px-4 pb-4">
                <div className="text-center my-3">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {selectedOffer.id === 'new-years' ? 'New Year, new YOU!' : selectedOffer.bannerTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {selectedOffer.subtitle}
                  </p>
                </div>

                {/* Offer Image Card inside phone */}
                <div className="mt-2 rounded-2xl overflow-hidden shadow-xs border border-slate-100 bg-slate-900 aspect-[4/3] relative">
                  <img
                    src={selectedOffer.bannerImage}
                    alt={selectedOffer.occasion}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
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
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-8 min-h-[500px] flex flex-col justify-center items-center">
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
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {oneTimeOffers.map((oto) => (
                <div key={oto.id} className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
                  <div
                    className="p-4 text-white flex items-center justify-between"
                    style={{ backgroundColor: oto.bannerBgColor }}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{oto.visibility}</span>
                      <h4 className="text-sm font-bold">{oto.headline}</h4>
                    </div>
                    <span className="text-lg font-extrabold">{oto.discountValue}%</span>
                  </div>
                  <div className="p-4 space-y-2 text-xs text-slate-600">
                    <p>{oto.message}</p>
                    <p className="text-[11px] text-slate-400">Expires in {oto.expiresInDays} days</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT DRAWER FOR AUTOMATED OFFER (Using SlideOverDrawer) */}
      <SlideOverDrawer
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        title={`Edit ${selectedOffer.occasion} Offer`}
        maxWidth="max-w-[480px]"
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
              Save Offer Settings
            </button>
          </>
        }
      >
        <div className="space-y-5 text-xs">
          {/* Hero Banner Preview */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative aspect-[16/9] bg-slate-900">
            <img
              src={selectedOffer.bannerImage}
              alt={selectedOffer.occasion}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
              <div>
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                  Holiday Event
                </span>
                <h4 className="text-sm font-bold text-white">{selectedOffer.bannerTitle}</h4>
                <p className="text-[11px] text-slate-300">{selectedOffer.dateWindow}</p>
              </div>
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <p className="font-bold text-slate-900">Offer Status</p>
              <p className="text-[11px] text-slate-400">Activate or deactivate this seasonal campaign.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {/* Discount Engine */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Discount Engine</label>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEditDiscountMode('Percentage')}
                  className={`px-3 py-1.5 rounded-lg ${
                    editDiscountMode === 'Percentage' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setEditDiscountMode('Set $ amount')}
                  className={`px-3 py-1.5 rounded-lg ${
                    editDiscountMode === 'Set $ amount' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Set $ amount
                </button>
              </div>

              <div className="relative flex-1">
                <input
                  type="number"
                  value={editDiscountVal}
                  onChange={(e) => setEditDiscountVal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-right pr-7 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  {editDiscountMode === 'Percentage' ? '%' : '$'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Algorithmic Targeting */}
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-purple-900 font-bold">
              <Sparkles size={14} className="text-purple-600" />
              <span>AI Algorithmic Targeting</span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editIncludeCart}
                onChange={(e) => setEditIncludeCart(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-[11px] text-slate-600 leading-snug">
                Include products recently added to cart or browsed, but never purchased
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editIncludeSimilar}
                onChange={(e) => setEditIncludeSimilar(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-[11px] text-slate-600 leading-snug">
                Include treatments most similar to previous purchases and visit history
              </span>
            </label>
          </div>

          {/* Voice Note Boost Banner */}
          <div className="p-4 bg-pink-50/70 border border-pink-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-pink-900 font-bold">
                <Volume2 size={14} className="text-pink-600" />
                <span>Audio Voice Note</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-200/80 text-pink-800">
                +158% conversion boost
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Add an authentic voice greeting from your doctor or aesthetician to play when patients tap this offer.
            </p>
            <button
              type="button"
              onClick={() => alert('Audio upload triggered')}
              className="w-full py-2.5 border border-dashed border-pink-300 rounded-xl bg-white text-xs font-semibold text-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload size={14} />
              <span>Upload greeting audio (.mp3, .wav)</span>
            </button>
          </div>
        </div>
      </SlideOverDrawer>

      {/* CREATE ONE-TIME OFFER DRAWER (Exact Match to Photo 4!) */}
      <SlideOverDrawer
        isOpen={openOneTimeDrawer}
        onClose={() => setOpenOneTimeDrawer(false)}
        title="Create a one-time offer"
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
              Create offer
            </button>
          </>
        }
      >
        <div className="space-y-5 text-xs">
          {/* Visibility */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2">
              Visibility
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['Public', 'Private'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    visibility === v
                      ? 'bg-white shadow-xs text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Date Row */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2">
              Date
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Start date</label>
                <div className="relative">
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Select date"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 pr-9"
                  />
                  <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Expires in</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={expiresIn === 0 ? '' : expiresIn}
                    onChange={(e) => setExpiresIn(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                    days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Promotion reward message */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Promotion reward message
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Promotion offer message</label>
              <input
                type="text"
                value={offerMsg}
                onChange={(e) => setOfferMsg(e.target.value)}
                placeholder="Enter promotion offer message"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Promotion offer headline</label>
              <input
                type="text"
                maxLength={100}
                value={offerHeadline}
                onChange={(e) => setOfferHeadline(e.target.value)}
                placeholder="Enter promotion offer headline"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
              <div className="text-right text-[10px] text-slate-400 mt-1 font-medium">
                {offerHeadline.length}/100
              </div>
            </div>
          </div>

          {/* Banner customization */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2">
              Banner customization
            </label>
            <div className="relative inline-flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors w-full">
              <input
                type="color"
                value={bannerColor}
                onChange={(e) => setBannerColor(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <span
                className="w-6 h-6 rounded-full border border-slate-300 shadow-2xs flex-shrink-0"
                style={{ backgroundColor: bannerColor }}
              />
              <span className="text-xs font-medium text-slate-700">Banner background color</span>
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Discount
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['Percentage', 'Set $ amount'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDiscountType(mode)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    discountType === mode
                      ? 'bg-white shadow-xs text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {discountType === 'Percentage' ? 'Percentage' : 'Amount'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={discountVal === 0 ? '' : discountVal}
                  onChange={(e) => setDiscountVal(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 pr-8"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {discountType === 'Percentage' ? '%' : '$'}
                </span>
              </div>
            </div>
          </div>

          {/* Product(s) */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Product(s)
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['Includes', 'Excludes'] as const).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setProductScope(scope)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    productScope === scope
                      ? 'bg-white shadow-xs text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {productScope === 'Includes' ? 'Included product(s)' : 'Excluded product(s)'}
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 hover:border-slate-300 transition-colors text-left"
              >
                <span>Select products</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              <p className="text-[11px] text-slate-400 leading-tight mt-1.5">
                Leave empty to apply discount to the entire shopping cart (app-wide discount)
              </p>
            </div>
          </div>
        </div>
      </SlideOverDrawer>
    </div>
  );
}
