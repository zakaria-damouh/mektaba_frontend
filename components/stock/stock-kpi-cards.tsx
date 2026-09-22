'use client';

import { useTranslation } from 'react-i18next';
import { TbCurrencyDirham, TbAlertCircle, TbAlertTriangle, TbPackage, TbCheck } from 'react-icons/tb';
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
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. Total Valuation */}
      <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center justify-between text-neutral-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {t('stock.totalValuation')}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80">
            <TbCurrencyDirham className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            {totalInventoryValue.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xs font-extrabold text-emerald-600">{t('common.dh')}</span>
          </div>
          <div className="mt-1 text-[11px] font-medium text-neutral-400">
            {t('stock.capitalShelves')}
          </div>
        </div>
      </div>

      {/* 2. Out of Stock */}
      <button
        type="button"
        onClick={() => onSelectTab(activeTab === 'out_of_stock' ? 'all' : 'out_of_stock')}
        className={`group flex flex-col justify-between text-start rounded-3xl p-5 transition-all duration-200 cursor-pointer border ${
          activeTab === 'out_of_stock'
            ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500 shadow-md -translate-y-0.5'
            : 'bg-white border-neutral-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-rose-200'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
            {t('stock.outOfStock')}
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-colors ${
              activeTab === 'out_of_stock'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-600 border border-rose-100 group-hover:bg-rose-100'
            }`}
          >
            <TbAlertCircle className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-rose-600">
            {outOfStockCount}{' '}
            <span className="text-xs font-bold text-rose-400">{t('common.units')}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-600/90">
            {activeTab === 'out_of_stock' ? (
              <>
                <TbCheck className="h-3 w-3 stroke-[3]" />
                {t('stock.filterActive')}
              </>
            ) : (
              t('stock.clickToFilter')
            )}
          </div>
        </div>
      </button>

      {/* 3. Low Stock */}
      <button
        type="button"
        onClick={() => onSelectTab(activeTab === 'low_stock' ? 'all' : 'low_stock')}
        className={`group flex flex-col justify-between text-start rounded-3xl p-5 transition-all duration-200 cursor-pointer border ${
          activeTab === 'low_stock'
            ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500 shadow-md -translate-y-0.5'
            : 'bg-white border-neutral-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-amber-200'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            {t('stock.lowStock')}
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-colors ${
              activeTab === 'low_stock'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 border border-amber-100 group-hover:bg-amber-100'
            }`}
          >
            <TbAlertTriangle className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-700">
            {lowStockCount}{' '}
            <span className="text-xs font-bold text-amber-400">{t('common.units')}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-800/90">
            {activeTab === 'low_stock' ? (
              <>
                <TbCheck className="h-3 w-3 stroke-[3]" />
                {t('stock.filterActive')}
              </>
            ) : (
              t('stock.toOrder')
            )}
          </div>
        </div>
      </button>

      {/* 4. Total Catalogue */}
      <button
        type="button"
        onClick={() => onSelectTab('all')}
        className={`group flex flex-col justify-between text-start rounded-3xl p-5 transition-all duration-200 cursor-pointer border ${
          activeTab === 'all'
            ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-600 shadow-md -translate-y-0.5'
            : 'bg-white border-neutral-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {t('stock.totalCatalog')}
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-colors ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 text-neutral-600 group-hover:bg-emerald-50 group-hover:text-emerald-600'
            }`}
          >
            <TbPackage className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            {totalCount}{' '}
            <span className="text-xs font-bold text-neutral-400">{t('common.units')}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            {activeTab === 'all' ? (
              <>
                <TbCheck className="h-3 w-3 stroke-[3]" />
                {t('stock.allArticles')}
              </>
            ) : (
              t('stock.resetFilter')
            )}
          </div>
        </div>
      </button>
    </div>
  );
}