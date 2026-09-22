'use client';

import {
  TbCurrencyDirham,
  TbTrendingUp,
  TbReceipt,
  TbCreditCard,
} from 'react-icons/tb';

interface SalesStatsProps {
  totalRevenue: number;
  totalProfit: number;
  totalSalesCount: number;
  cashTotal: number;
  cardTotal: number;
}

export function SalesStats({
  totalRevenue,
  totalProfit,
  totalSalesCount,
  cashTotal,
  cardTotal,
}: SalesStatsProps) {
  const averageBasket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. Total Revenue */}
      <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between text-neutral-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Chiffre d'Affaires
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 shadow-xs">
            <TbCurrencyDirham className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            {totalRevenue.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xs font-extrabold text-emerald-600">DH</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-medium">
            Espèces : {cashTotal.toFixed(0)} DH • Carte : {cardTotal.toFixed(0)} DH
          </div>
        </div>
      </div>

      {/* 2. Estimated Net Profit */}
      <div className="flex flex-col justify-between rounded-3xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between text-emerald-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Bénéfice Net Estimé
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200/60 shadow-xs">
            <TbTrendingUp className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-700">
            +{totalProfit.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xs font-extrabold text-emerald-600">DH</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-800/80 font-bold">
            Marge réelle calculée
          </div>
        </div>
      </div>

      {/* 3. Transactions Count */}
      <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between text-neutral-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Transactions
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 shadow-xs">
            <TbReceipt className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            {totalSalesCount}{' '}
            <span className="text-xs font-bold text-neutral-400">tickets</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-medium">
            Ventes validées en caisse
          </div>
        </div>
      </div>

      {/* 4. Average Basket */}
      <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between text-neutral-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Panier Moyen
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 shadow-xs">
            <TbCreditCard className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            {averageBasket.toFixed(2)}{' '}
            <span className="text-xs font-extrabold text-emerald-600">DH</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-medium">
            Dépense moyenne par client
          </div>
        </div>
      </div>
    </div>
  );
}