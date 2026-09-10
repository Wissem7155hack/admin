import { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  DollarSign,
  Bookmark,
  Megaphone,
  ThumbsUp,
  ChevronDown,
  Gift,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MembershipRecord, MembershipTreatment } from '../../types';

interface Props {
  membership?: MembershipRecord | null;
  onOpenCreate?: () => void;
  clinicName?: string;
}

const DEFAULT_CLIENT_RESULTS = [
  {
    photoUrl:
      'https://jndcmymcnivessmvzpzc.supabase.co/storage/v1/object/public/membership-media/client-results/before_after.webp',
    text: "The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn't be happier with the results!",
    clientName: 'Sarah M.',
    treatmentTag: 'After 3 months on Refined Method',
  },
  {
    photoUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    text: 'Clearer skin, smaller pores, and effortless daily radiance. Best investment in self care!',
    clientName: 'Elena R.',
    treatmentTag: 'After 6 HydraFacials & Peels',
  },
];

export default function MembershipPhonePreviewContent({
  membership,
  onOpenCreate,
  clinicName = 'Refined Skin & Body',
}: Props) {
  // Default expanded treatment id (HydraFacial open by default matching Photo 2)
  const [expandedTreatmentId, setExpandedTreatmentId] = useState<string | null>('1');
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [viewingTreatment, setViewingTreatment] = useState<MembershipTreatment | null>(null);

  // If user clicked "View treatment", show the dedicated interactive Treatment View Screen inside the phone
  if (viewingTreatment) {
    return (
      <div className="w-full h-full bg-white flex flex-col overflow-y-auto text-slate-800 scroll-smooth selection:bg-pink-100 animate-in fade-in duration-150">
        {/* Top Header / Back Navigation Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewingTreatment(null)}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-pink-600 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Back to Membership</span>
          </button>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {clinicName}
          </span>
        </div>

        {/* Hero Photo */}
        <div className="relative w-full aspect-[4/3] bg-slate-900 flex-shrink-0">
          <img
            src={
              viewingTreatment.photoUrl ||
              'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600'
            }
            alt={viewingTreatment.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-pink-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Included in Plan
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block text-[9px] font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">
                Session
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {viewingTreatment.unit || '1 treatment'} • 45 min
              </span>
            </div>
            <h3 className="text-lg font-black text-[#25262C] mt-1 tracking-tight leading-tight">
              {viewingTreatment.name}
            </h3>
            <p className="text-xs font-bold text-pink-600 mt-0.5">
              Included in {membership?.name || 'Membership'}
              <span className="text-slate-400 line-through ml-2 text-[10px] font-normal">
                Usually £120
              </span>
            </p>
          </div>

          {/* Membership Highlight Box */}
          <div className="p-3 bg-[#F7F8F8] rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#25262C]">
              <Sparkles size={14} className="text-pink-500" />
              <span>Monthly Membership Benefit</span>
            </div>
            <p className="text-[10px] text-[#6F7788] mt-1 leading-relaxed">
              As an active {membership?.name || 'Member'}, you can choose this treatment as your complimentary monthly session.
            </p>
          </div>

          {/* Treatment Description */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-[#25262C]">About this treatment</h4>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              {viewingTreatment.description ||
                'The HydraFacial delivers unparalleled skin refinement, deep hydration, and luminous radiance, leaving your complexion smooth, refreshed, and exceptionally glowing after just one session.'}
            </p>
          </div>

          {/* Before Treatment Care */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-[#25262C]">Pre-treatment preparation</h4>
            <ul className="text-[10px] text-slate-600 space-y-1">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Avoid direct sun exposure and retinoids for 48 hours prior.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Arrive with clean, makeup-free skin for optimal results.</span>
              </li>
            </ul>
          </div>

          {/* Aftercare */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-[#25262C]">Aftercare guidance</h4>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Apply broad-spectrum SPF 50 daily, keep skin thoroughly hydrated, and avoid harsh exfoliants for 72 hours.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2 pb-6">
            <button
              type="button"
              onClick={() => alert(`Appointment booking simulation for ${viewingTreatment.name}`)}
              className="w-full py-2.5 bg-[#8c6b75] hover:bg-[#785b65] text-white rounded-xl text-xs font-bold shadow-md shadow-slate-300 transition-all cursor-pointer"
            >
              Book {viewingTreatment.name} Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Zero-State if no membership created yet
  if (!membership) {
    return (
      <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 mb-3.5 animate-pulse">
          <Sparkles size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-900 tracking-tight">Create your first memberships!!</h4>
        <p className="text-xs text-slate-500 mt-2 px-2 leading-relaxed">
          Design recurring plans, add included monthly treatments, and boost client retention.
        </p>

        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="mt-5 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white rounded-full text-xs font-bold shadow-md shadow-pink-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} />
            <span>Create membership</span>
          </button>
        )}
      </div>
    );
  }

  // Live Membership Data
  const heroImage =
    membership.imageUrl ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';
  const tagline = membership.tagline || (membership.name ? `TRY ${membership.name.toUpperCase()}` : 'TRY REFINED METHOD');
  const subtitle = membership.subtitle || 'The membership that pays for itself';
  const currency = membership.currency || '£';
  const price = membership.price || 149;
  const commitment = membership.commitmentMonths || 6;

  const defaultBenefits = [
    '15% off advanced laser resurfacing procedures',
    '15% off all advanced facial treatments',
    '15% off skin rejuvenation services like microneedling and peels',
  ];
  const bulletBenefits =
    membership.benefits && membership.benefits.length > 0 ? membership.benefits : defaultBenefits;

  const defaultCards = [
    { id: '1', title: 'Savings', desc: 'See big savings on treatments from exclusive member-only discounts!', icon: 'dollar' },
    { id: '2', title: 'Priority booking', desc: 'Enjoy priority booking for hassle-free scheduling and access!', icon: 'bookmark' },
    { id: '3', title: 'Exclusive events', desc: 'Attend exclusive events for special offers, treatments and wellness tips!', icon: 'megaphone' },
    { id: '4', title: 'Free treatments', desc: 'Get free treatments with your membership on top of special promotions!', icon: 'thumb' },
  ];
  const benefitCards =
    membership.benefitCards && membership.benefitCards.length > 0 ? membership.benefitCards : defaultCards;

  const defaultTreatments: MembershipTreatment[] = [
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
  ];

  const treatments =
    membership.includedTreatments && membership.includedTreatments.length > 0
      ? membership.includedTreatments
      : defaultTreatments;

  // Client Results Data with fallback to photo
  const clientResults =
    membership.testimonials && membership.testimonials.length > 0
      ? membership.testimonials.map((t, idx) => ({
          photoUrl: t.photoUrl || DEFAULT_CLIENT_RESULTS[0].photoUrl,
          text: t.text || DEFAULT_CLIENT_RESULTS[0].text,
          clientName: idx === 0 ? 'Sarah M.' : 'Elena R.',
          treatmentTag: 'After 3 months on Refined Method',
        }))
      : DEFAULT_CLIENT_RESULTS;

  const currentResult = clientResults[activeResultIndex] || clientResults[0];

  const giftCallout =
    membership.bonuses && membership.bonuses.length > 0
      ? membership.bonuses[0].description
      : 'Sign up to immediately claim a complimentary HydraFacial!';

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-y-auto text-slate-800 scroll-smooth selection:bg-pink-100">
      {/* Top Hero Banner */}
      <div className="relative w-full aspect-[4/3] bg-slate-900 flex-shrink-0">
        <img
          src={heroImage}
          alt={membership.name}
          className="w-full h-full object-cover opacity-90"
        />
        {/* Floating Price Pill in header */}
        <div className="absolute top-8 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white font-bold text-[11px] border border-white/20">
          {currency}{price}/mo
        </div>
      </div>

      {/* Sign-up Bonus Banner */}
      {giftCallout && (
        <div className="mx-4 mt-3 mb-1 p-2.5 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/80 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Gift size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[8px] font-extrabold uppercase text-pink-600 tracking-wider">Sign-up Bonus</span>
            <p className="text-[9px] font-semibold text-slate-800 leading-tight truncate">{giftCallout}</p>
          </div>
        </div>
      )}

      {/* Intro Section (Photo 1) */}
      <div className="p-4 space-y-2 border-b border-slate-100">
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
          {tagline}
        </span>
        <h3 className="text-base font-black text-slate-900 tracking-tight leading-tight">
          {subtitle}
        </h3>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          {membership.description ||
            `The ${membership.name} is your key to consistently radiant skin. This membership provides exclusive access to our most effective treatments at Refined Skin And Body, ensuring your complexion remains flawless year-round. Enjoy a curated selection of monthly services and member-only discounts on advanced procedures. For optimal, transformative results, a commitment of at least ${commitment} months is recommended.`}
        </p>
      </div>

      {/* Membership Benefits List (Photo 2) */}
      <div className="p-4 space-y-3 border-b border-slate-100">
        <h4 className="text-sm font-black text-slate-900 tracking-tight">
          Membership benefits
        </h4>
        <div className="space-y-2">
          {bulletBenefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <span className="text-[10px] text-slate-600 font-medium leading-tight">
                {benefit}
              </span>
            </div>
          ))}
        </div>

        {/* 2x2 Highlights Block (Photo 2) */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {benefitCards.map((card: any, idx) => (
            <div
              key={idx}
              className="bg-[#785b65] text-white p-2.5 rounded-xl flex flex-col justify-between min-h-[90px] shadow-xs"
            >
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center mb-1 text-[11px] font-bold">
                {idx === 0 && <DollarSign size={12} />}
                {idx === 1 && <Bookmark size={12} />}
                {idx === 2 && <Megaphone size={12} />}
                {idx === 3 && <ThumbsUp size={12} />}
              </div>
              <div>
                <h5 className="text-[10px] font-bold tracking-tight text-white">{card.title}</h5>
                <p className="text-[8px] text-white/80 leading-tight mt-0.5 line-clamp-3">
                  {card.description || card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Included Treatments Section (Photo 2 & 3) */}
      <div className="p-4 space-y-2.5 border-b border-slate-100">
        <h4 className="text-sm font-black text-slate-900 tracking-tight">
          {membership.treatmentsHeader || 'Included treatments'}
        </h4>
        <p className="text-[10px] text-slate-500">
          Choose 1 from the following every month
        </p>

        <div className="space-y-2 pt-1">
          {treatments.map((t) => {
            const isExpanded = expandedTreatmentId === t.id;
            return (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <div className="p-2.5 flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={
                        t.photoUrl ||
                        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=300'
                      }
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[8px] font-bold bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded">
                      Session
                    </span>
                    <p className="text-[9px] text-slate-400 mt-0.5">{t.unit || '1 treatment'}</p>
                    <h5 className="text-[11px] font-bold text-slate-900 truncate">{t.name}</h5>
                  </div>
                </div>

                <div className="px-2.5 pb-2.5 pt-0">
                  <button
                    type="button"
                    onClick={() => setExpandedTreatmentId(isExpanded ? null : t.id)}
                    className="flex items-center justify-between w-full text-[9px] text-slate-800 font-semibold hover:text-pink-600 transition-colors pt-1 border-t border-slate-100 cursor-pointer"
                  >
                    <span>Learn more about this treatment</span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                      <p className="text-[9px] text-slate-600 leading-relaxed">
                        {t.description ||
                          'The HydraFacial delivers unparalleled skin refinement, deep hydration, and luminous radiance, leaving your complexion smooth, refreshed, and exceptionally glowing after just one session.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setViewingTreatment(t)}
                        className="flex items-center gap-1 text-[9px] font-bold text-[#8c6b75] hover:text-pink-600 hover:underline cursor-pointer"
                      >
                        <span>View treatment</span>
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Results Section matching photo 1 with Navigable Results Carousel */}
      <div className="p-4 space-y-3 bg-slate-50/70 border-b border-slate-100">
        <div className="text-center space-y-0.5">
          <h4 className="text-sm font-black text-slate-900 tracking-tight">
            Member results
          </h4>
          <p className="text-[10px] text-slate-400">
            Customers and Clients are raving
          </p>
        </div>

        {/* Navigable Side-by-Side Comparison Card */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 relative">
          <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden bg-slate-100">
            <img
              src={currentResult.photoUrl || '/images/before_after.webp'}
              onError={(e) => { e.currentTarget.src = '/images/before_after.webp'; }}
              alt="Member Result"
              className="w-full h-full object-cover"
            />

            {/* Carousel Arrow Navigation Buttons */}
            {clientResults.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveResultIndex((prev) => (prev > 0 ? prev - 1 : clientResults.length - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white backdrop-blur-xs flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveResultIndex((prev) => (prev < clientResults.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white backdrop-blur-xs flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </>
            )}
          </div>

          <p className="text-[9px] text-slate-600 italic leading-relaxed text-center px-1">
            "{currentResult.text}"
          </p>

          {/* Dots Indicator */}
          {clientResults.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 pt-1">
              {clientResults.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveResultIndex(i)}
                  className={`h-1 rounded-full transition-all cursor-pointer ${
                    activeResultIndex === i ? 'w-4 bg-[#8c6b75]' : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Burgundy Subscribe Button matching Photo */}
        <button
          type="button"
          className="w-full py-2.5 bg-[#8c6b75] hover:bg-[#785b65] active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md shadow-slate-300 transition-all cursor-pointer"
        >
          Subscribe now!
        </button>

        {/* Luxury Claim Complimentary Treatment Card matching reference */}
        <div className="bg-[#F7F8F8] p-[1rem] flex items-center gap-2 rounded-[1rem] shadow-[0_21px_46px_0px_rgba(0,80,96,0.1)] mt-2">
          <div className="flex-shrink-0">
            <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_2448_1789)">
                <path d="M23.5861 13.6755L4.17595 14.5578L3.17587 9.34534L23.9124 8.31876L23.5861 13.6755Z" fill="#25262C" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
                <path d="M23.586 13.6756L6.54592 14.4551L5.54584 9.24267L23.9123 8.31892L23.586 13.6756Z" fill="white" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
                <path d="M14.363 14.1158L10.5039 14.2833L9.36871 9.05025L15.0412 8.73776L14.363 14.1158Z" fill="#906c77" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
                <path d="M21.7719 23.4989L7.46842 24.288L6.23047 14.4688L21.9954 13.7849L21.7719 23.4989Z" fill="#25262C" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
                <path d="M21.772 23.4991L9.2475 24.211L8.00955 14.3918L21.9955 13.7851L21.772 23.4991Z" fill="#906c77" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
                <path d="M16.4282 23.7826L12.5691 23.95L11.6035 14.2358L16.3919 14.0027L16.4282 23.7826Z" fill="white" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
                <path d="M7.10943 3.71034C5.02833 4.95719 6.43535 7.65412 10.2729 8.95559L11.9157 8.88432C11.9157 8.88432 10.4937 1.68273 7.10943 3.71034Z" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
                <path d="M11.9154 8.88423C11.9154 8.88423 13.3551 3.10566 16.4398 3.97271C19.5246 4.83976 15.8226 8.71472 11.9154 8.88423Z" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
                <path d="M13.0749 3.14028C13.0749 3.14028 11.6422 6.34557 11.9155 8.8841" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
                <path d="M9.07129 6.61377C9.07129 6.61377 10.9444 7.71525 11.752 9.10279" stroke="#25262C" strokeWidth="0.803654" strokeMiterlimit="10" />
              </g>
              <defs>
                <clipPath id="clip0_2448_1789">
                  <rect width="24" height="24" fill="white" transform="translate(2.38379 0.867188) rotate(5.70065)" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="text-[#25262C] text-[0.875rem] leading-[1.25rem] font-tt-norms line-clamp-3 overflow-hidden">
            <span className="text-[#6F7788]">Sign up to immediately</span> claim a complimentary <span>HydraFacial</span>!
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
