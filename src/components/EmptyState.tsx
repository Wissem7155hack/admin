import { handleImageError } from '../hooks/useSupabaseData';


interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({ title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={'flex flex-col items-center justify-center text-center p-8 ' + className}>
      <div className="relative w-36 h-36 mb-5 flex items-center justify-center">
        <img
          src="/images/empty-state-image.webp"
          alt="Empty state"
          onError={handleImageError}
          className="w-full h-full object-contain filter drop-shadow-xs"
          loading="lazy"
        />
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md active:scale-[0.98]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
