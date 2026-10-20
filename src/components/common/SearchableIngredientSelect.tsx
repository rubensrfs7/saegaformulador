import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { IngredientDef } from '../../types';

interface SearchableIngredientSelectProps {
  value: string;
  onChange: (ingredientId: string) => void;
  ingredients: IngredientDef[];
  theme?: 'orange' | 'green' | 'blue';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Helper to remove accents for fuzzy/accent-insensitive Portuguese search
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function SearchableIngredientSelect({
  value,
  onChange,
  ingredients,
  theme = 'blue',
  placeholder = 'Selecione um insumo...',
  className = '',
  disabled = false
}: SearchableIngredientSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; openUpward: boolean }>({
    top: 0,
    left: 0,
    width: 320,
    openUpward: false
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedIngredient = useMemo(() => {
    return ingredients.find(i => i.id === value);
  }, [ingredients, value]);

  // Accent-insensitive and case-insensitive filter
  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return ingredients;
    const term = normalizeText(search.trim());
    return ingredients.filter(i => {
      const nameNorm = normalizeText(i.name);
      const typeNorm = normalizeText(i.type);
      return nameNorm.includes(term) || typeNorm.includes(term);
    });
  }, [ingredients, search]);

  // Update coords when opening or on scroll/resize
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 310;
    const openUpward = spaceBelow < popoverHeight && rect.top > popoverHeight;

    const top = openUpward ? rect.top - popoverHeight - 4 : rect.bottom + 4;
    // Keep popover inside viewport width
    const targetWidth = Math.max(rect.width, 340);
    const maxLeft = window.innerWidth - targetWidth - 12;
    const left = Math.max(12, Math.min(rect.left, maxLeft));

    setCoords({
      top,
      left,
      width: targetWidth,
      openUpward
    });
  };

  const handleOpen = () => {
    if (disabled) return;
    updatePosition();
    setIsOpen(true);
  };

  // Re-position or close on window scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (e: Event) => {
      // Don't close if scrolling inside popover
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      updatePosition();
    };

    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const themeStyles = {
    orange: {
      ring: 'focus:ring-orange-500 focus:border-orange-500',
      activeItem: 'bg-orange-50 text-orange-950 font-bold',
      highlightBadge: 'bg-orange-100 text-orange-700',
      activeCheck: 'text-orange-600',
      borderFocus: 'border-orange-500 ring-2 ring-orange-200'
    },
    green: {
      ring: 'focus:ring-green-500 focus:border-green-500',
      activeItem: 'bg-green-50 text-green-950 font-bold',
      highlightBadge: 'bg-green-100 text-green-700',
      activeCheck: 'text-green-600',
      borderFocus: 'border-green-500 ring-2 ring-green-200'
    },
    blue: {
      ring: 'focus:ring-blue-500 focus:border-blue-500',
      activeItem: 'bg-blue-50 text-blue-950 font-bold',
      highlightBadge: 'bg-blue-100 text-blue-700',
      activeCheck: 'text-blue-600',
      borderFocus: 'border-blue-500 ring-2 ring-blue-200'
    }
  }[theme];

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className={`w-full flex items-center justify-between border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm bg-white text-left transition shadow-2xs hover:border-gray-300 focus:outline-none focus:ring-2 ${themeStyles.ring} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? themeStyles.borderFocus : ''}`}
        title={selectedIngredient ? `${selectedIngredient.name} (${selectedIngredient.msPercent}% MS)` : placeholder}
      >
        <span className="truncate pr-2 font-medium text-gray-800">
          {selectedIngredient ? (
            <span className="flex items-center gap-1.5 truncate">
              <span className="truncate">{selectedIngredient.name}</span>
              <span className="text-[11px] font-semibold text-gray-400 shrink-0">
                ({selectedIngredient.msPercent}% MS)
              </span>
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Portal Dropdown Menu with Search Bar */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999
            }}
            className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Search Box Header */}
            <div className="p-2.5 border-b border-gray-100 bg-gray-50/90">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar insumo... (ex: Milho, Farelo, Silagem)"
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 font-normal"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="flex justify-between items-center px-1 pt-1.5 text-[10px] text-gray-400 font-medium">
                <span>{filteredIngredients.length} {filteredIngredients.length === 1 ? 'insumo disponível' : 'insumos disponíveis'}</span>
                {search && <span className="truncate max-w-[140px]">Filtro: "{search}"</span>}
              </div>
            </div>

            {/* Scrollable List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
              {filteredIngredients.length > 0 ? (
                filteredIngredients.map((item) => {
                  const isSelected = item.id === value;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between gap-2 hover:bg-gray-50 cursor-pointer ${
                        isSelected ? themeStyles.activeItem : 'text-gray-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="truncate font-semibold text-gray-800">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-gray-500">{item.type}</span>
                          <span>•</span>
                          <span>PB: {(item.pb / 10).toFixed(1)}%</span>
                          <span>•</span>
                          <span>NDT: {(item.ndt / 10).toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {item.msPercent}% MS
                        </span>
                        {isSelected && (
                          <Check size={14} className={`${themeStyles.activeCheck} stroke-[2.5]`} />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-6 px-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">Nenhum insumo encontrado</p>
                  <p className="text-[10px] text-gray-400 mt-1">Tente pesquisar com outro termo</p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
