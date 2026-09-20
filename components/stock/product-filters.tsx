'use client';

import { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, LayoutGrid, List } from 'lucide-react';

export type FilterTab = 'all' | 'low_stock' | 'services';
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
  totalCount: number;
  lowStockCount: number;
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
  totalCount,
  lowStockCount,
  servicesCount,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Top Filter Tabs & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onTabChange('all')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tous ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => onTabChange('low_stock')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'low_stock'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            Alerte Stock ({lowStockCount})
          </button>

          <button
            type="button"
            onClick={() => onTabChange('services')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'services'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Services ({servicesCount})
          </button>
        </div>

        {/* View Switcher (Table vs Squares) */}
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title="Vue Tableau"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
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
            title="Vue Carrés / Grille"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
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

      {/* Search & Category Select */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Recherche par nom ou code-barres..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}