import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Sparkles, Download, ShieldCheck, Smartphone } from 'lucide-react';

export interface ClinicPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: {
    id: string;
    name: string;
    slug: string;
    full_name?: string;
    tagline?: string;
    address?: string;
    logo_url?: string;
    hero_image?: string;
  };
}

export default function ClinicPosterModal({ isOpen, onClose, clinic }: ClinicPosterModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const pairingUri = `nexcore://clinic?id=${clinic.id}&slug=${clinic.slug}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    const svgEl = cardRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${clinic.slug}-pairing-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Embedded Print Styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #nexcore-printable-poster,
          #nexcore-printable-poster * {
            visibility: visible !important;
          }
          #nexcore-printable-poster {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            max-width: 480px !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            background: #0B0D13 !important;
            border: 2px solid #C5A880 !important;
            border-radius: 24px !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Outer Modal Window */}
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">In-Clinic Pairing Poster</h2>
              <p className="text-xs text-slate-400">Countertop display for patient device onboarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-slate-950/70">
          {/* THE LUXURY POSTER CARD */}
          <div
            id="nexcore-printable-poster"
            ref={cardRef}
            className="relative w-full max-w-md rounded-3xl bg-[#0B0D13] p-8 border border-[#C5A880]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(197,168,128,0.15)] flex flex-col items-center text-center overflow-hidden"
          >
            {/* Ambient Gold Glow Elements */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Subtle Gold Corner Accents */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#C5A880]/50 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#C5A880]/50 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#C5A880]/50 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#C5A880]/50 rounded-br-sm pointer-events-none" />

            {/* Clinic Monogram / Logo */}
            <div className="relative mb-4 z-10">
              {clinic.logo_url ? (
                <img
                  src={clinic.logo_url}
                  alt={clinic.name}
                  className="w-16 h-16 object-contain rounded-2xl p-1 bg-[#151923] border border-[#C5A880]/40 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1C212E] to-[#121620] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] font-serif text-2xl font-bold shadow-inner">
                  {clinic.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Clinic Name & Subtitle */}
            <div className="z-10 mb-6">
              <h1 className="text-xl font-bold tracking-tight text-white font-serif">
                {clinic.full_name || clinic.name}
              </h1>
              <p className="text-xs text-[#C5A880] tracking-widest uppercase font-medium mt-1">
                {clinic.tagline || 'Exclusive Aesthetic Portal'}
              </p>
            </div>

            {/* QR Code Canvas Frame */}
            <div className="relative z-10 p-4 bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-[#E5C590]/30 transition-transform duration-300 hover:scale-[1.02]">
              <QRCodeSVG
                value={pairingUri}
                size={210}
                bgColor="#FFFFFF"
                fgColor="#0B0D13"
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Call to Action */}
            <div className="z-10 mt-6 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181D29] border border-[#C5A880]/30 text-[#E5C590] text-xs font-semibold tracking-wide">
                <Smartphone className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Scan with Nexcore App</span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-[260px] leading-relaxed mx-auto">
                Point your phone camera or the in-app scanner to pair with this clinic and activate VIP rewards.
              </p>
            </div>

            {/* Footer Brand Seal */}
            <div className="z-10 mt-6 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-wider">
              <div className="flex items-center gap-1 text-[#C5A880]/70">
                <ShieldCheck className="w-3 h-3" />
                <span>NEXCORE PROTOCOL</span>
              </div>
              <span className="uppercase">SLUG: {clinic.slug}</span>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono truncate max-w-[240px]">
            {pairingUri}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export SVG</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#C5A880] hover:from-[#E5C590] hover:to-[#D4AF37] transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Poster / Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
