import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, X } from 'lucide-react';

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  showCloseX?: boolean;
}

export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-[500px]',
  showCloseX = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setMounted(true);
      // Next frame trigger transition for silky smooth slide-in
      timer = setTimeout(() => {
        setVisible(true);
      }, 15);

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
      };
    } else {
      // Trigger slide-out
      setVisible(false);
      timer = setTimeout(() => {
        setMounted(false);
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSmoothClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
      setMounted(false);
    }, 220);
  };

  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSmoothClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden">
      {/* Dimmed backdrop with smooth opacity transition */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-240 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleSmoothClose}
      />

      {/* Drawer panel with rounded-l-3xl matching photo 1, buttery smooth slide */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white h-screen shadow-2xl rounded-l-3xl flex flex-col justify-between border-l border-slate-100 transform transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header with back arrow on left and centered bold title */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 flex-shrink-0 bg-white rounded-tl-3xl">
          <button
            type="button"
            onClick={handleSmoothClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center flex-1 pr-6">
            {title}
          </h2>
          {showCloseX ? (
            <button
              type="button"
              onClick={handleSmoothClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          ) : (
            <div className="w-2" />
          )}
        </div>

        {/* Scrollable content container */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {children}
        </div>

        {/* Fixed footer at bottom with rounded-bl-3xl */}
        {footer && (
          <div className="border-t border-slate-100 px-7 py-4 flex items-center justify-between flex-shrink-0 bg-white rounded-bl-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SlideOverDrawer;
