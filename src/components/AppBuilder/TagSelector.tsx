import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { TREATMENT_TAGS } from '../../data/treatments';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleTag = (label: string) => {
    if (selectedTags.includes(label)) {
      onChange(selectedTags.filter((t) => t !== label));
    } else {
      onChange([...selectedTags, label]);
    }
  };

  const filteredTags = TREATMENT_TAGS.filter((t) =>
    t.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={popoverRef}>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tag(s)</label>

      {/* Selected tags badges */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 text-xs font-medium border border-pink-200/80"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="hover:text-pink-900"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-slate-300 transition-colors shadow-xs"
      >
        <span>{selectedTags.length > 0 ? `${selectedTags.length} tag(s) selected` : 'Select tag(s)'}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover matching Image 3 */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 max-h-[460px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search bar */}
          <div className="relative mb-3 flex-shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          {/* 5-column grid */}
          <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-5 gap-2.5 py-1">
            {filteredTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.label);
              return (
                <button
                  key={tag.file}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border text-center group ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/60 shadow-xs ring-1 ring-pink-500'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-1.5 relative">
                    <img
                      src={`/treatments/${tag.file}`}
                      alt={tag.label}
                      className="max-w-full max-h-full object-contain filter drop-shadow-xs"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-600 rounded-full flex items-center justify-center text-white shadow-xs">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[11px] leading-tight line-clamp-2 transition-colors ${
                      isSelected ? 'font-bold text-pink-900' : 'font-medium text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {tag.label}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredTags.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No tags found matching "{searchTerm}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default TagSelector;
