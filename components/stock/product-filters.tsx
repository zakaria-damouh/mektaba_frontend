'use client';

import { useRef, useEffect } from 'react';
import { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Search, LayoutGrid, List } from 'lucide-react';

export type FilterTab = 'all' | 'out_of_stock' | 'low_stock' | 'services';
export type ViewMode = 'table' | 'grid';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  servicesCount: number;
  categories: Category[];
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  servicesCount,
  categories,
}: ProductFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press "/" to instantly focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-3">
      {/* Search, Category, and View Switcher */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            ref={searchInputRef}
            placeholder="Rechercher nom ou code-barres (Taper '/' pour chercher)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-12 bg-white"
          />
          <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-400">
            /
          </kbd>
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Services Tab Pill & View Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTabChange(activeTab === 'services' ? 'all' : 'services')}
            className={`h-10 rounded-xl px-3 text-xs font-semibold transition-colors border ${
              activeTab === 'services'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Services ({servicesCount})
          </button>

          {/* View Mode Toggle */}
          <div className="inline-flex h-10 items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              title="Vue Tableau"
              className={`flex items-center gap-1.5 h-full rounded-lg px-2.5 text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Vue Carrés"
              className={`flex items-center gap-1.5 h-full rounded-lg px-2.5 text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Carrés</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}