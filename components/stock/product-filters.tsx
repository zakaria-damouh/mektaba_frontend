'use client';

import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Category } from '@/types';
import {
  TbSearch,
  TbLayoutGrid,
  TbList,
  TbSparkles,
  TbX,
  TbCategory,
} from 'react-icons/tb';

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
  const { t } = useTranslation();
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search & Category Capsule */}
        <div className="flex-1 flex items-center rounded-full border border-neutral-200/90 bg-white p-1.5 px-4 shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10">
          <div className="flex items-center flex-1 gap-2 min-w-0">
            <TbSearch className="h-4 w-4 shrink-0 text-neutral-400 stroke-[2.2]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('stock.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <TbX className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden md:inline-flex h-5 select-none items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 font-mono text-[10px] font-bold text-neutral-400">
              /
            </kbd>
          </div>

          <div className="h-6 w-[1px] bg-neutral-200 mx-2 shrink-0 hidden sm:block" />

          <div className="relative shrink-0 hidden sm:flex items-center gap-1.5">
            <TbCategory className="h-3.5 w-3.5 text-neutral-400 stroke-[2]" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-neutral-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">{t('stock.allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange(activeTab === 'services' ? 'all' : 'services')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 border cursor-pointer ${
              activeTab === 'services'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                : 'bg-white text-neutral-600 border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:shadow-sm'
            }`}
          >
            <TbSparkles className={`h-3.5 w-3.5 ${activeTab === 'services' ? 'text-white' : 'text-emerald-600'}`} />
            <span>{t('stock.services')} ({servicesCount})</span>
          </button>

          {/* View Toggle */}
          <div className="inline-flex items-center rounded-full border border-neutral-200/90 bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              title={t('stock.viewTable')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <TbList className="h-4 w-4 stroke-[2.2]" />
              <span className="hidden sm:inline">{t('stock.viewTable')}</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title={t('stock.viewGrid')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <TbLayoutGrid className="h-4 w-4 stroke-[2.2]" />
              <span className="hidden sm:inline">{t('stock.viewGrid')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}