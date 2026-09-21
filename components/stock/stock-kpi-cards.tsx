'use client';

import { DollarSign, AlertCircle, AlertTriangle, Package } from 'lucide-react';
import { FilterTab } from './product-filters';

interface StockKpiCardsProps {
  totalCount: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalInventoryValue: number;
  activeTab: FilterTab;
  onSelectTab: (tab: FilterTab) => void;
}

export function StockKpiCards({
  totalCount,
  outOfStockCount,
  lowStockCount,
  totalInventoryValue,
  activeTab,
  onSelectTab,
}: StockKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Stock Valuation (Cash on Shelves) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold">Valeur du Stock (Achat)</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
          {totalInventoryValue.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          <span className="text-xs font-bold text-slate-400">DH</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Capital immobilisé en rayon
        </div>
      </div>

      {/* 2. Out of Stock (Clickable Filter) */}
      <button
        type="button"
        onClick={() => onSelectTab(activeTab === 'out_of_stock' ? 'all' : 'out_of_stock')}
        className={`flex flex-col justify-between text-left rounded-2xl p-4 transition-all border ${
          activeTab === 'out_of_stock'
            ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500 shadow-sm'
            : 'bg-white border-slate-200 hover:border-rose-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between w-full text-slate-500">
          <span className="text-xs font-semibold text-rose-700">En Rupture (0)</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black text-rose-600">
          {outOfStockCount}{' '}
          <span className="text-xs font-bold text-rose-400">articles</span>
        </div>
        <div className="mt-1 text-[11px] text-rose-600/80 font-medium">
          {activeTab === 'out_of_stock' ? '✓ Filtre activé' : 'Cliquer pour afficher'}
        </div>
      </button>

      {/* 3. Low Stock (Clickable Filter) */}
      <button
        type="button"
        onClick={() => onSelectTab(activeTab === 'low_stock' ? 'all' : 'low_stock')}
        className={`flex flex-col justify-between text-left rounded-2xl p-4 transition-all border ${
          activeTab === 'low_stock'
            ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500 shadow-sm'
            : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between w-full text-slate-500">
          <span className="text-xs font-semibold text-amber-700">Stock Faible</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black text-amber-600">
          {lowStockCount}{' '}
          <span className="text-xs font-bold text-amber-400">articles</span>
        </div>
        <div className="mt-1 text-[11px] text-amber-700/80 font-medium">
          {activeTab === 'low_stock' ? '✓ Filtre activé' : 'À réapprovisionner'}
        </div>
      </button>

      {/* 4. Total Catalogue (Clickable to reset filters) */}
      <button
        type="button"
        onClick={() => onSelectTab('all')}
        className={`flex flex-col justify-between text-left rounded-2xl p-4 transition-all border ${
          activeTab === 'all'
            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 shadow-sm'
            : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between w-full text-slate-500">
          <span className="text-xs font-semibold text-slate-700">Total Catalogue</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Package className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
          {totalCount}{' '}
          <span className="text-xs font-bold text-slate-400">articles</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 font-medium">
          {activeTab === 'all' ? '✓ Tous les articles' : 'Cliquer pour tout voir'}
        </div>
      </button>
    </div>
  );
}