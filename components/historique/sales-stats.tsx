'use client';

import { DollarSign, TrendingUp, ShoppingBag, CreditCard } from 'lucide-react';

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Revenue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium">Chiffre d'Affaires</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
          {totalRevenue.toFixed(2)} <span className="text-xs font-bold text-slate-400">DH</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Espèces: {cashTotal.toFixed(0)} DH • Carte: {cardTotal.toFixed(0)} DH
        </div>
      </div>

      {/* Net Profit */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium">Bénéfice Estimé</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-600">
          +{totalProfit.toFixed(2)} <span className="text-xs font-bold text-emerald-400">DH</span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-700/80 font-medium">
          Marge nette calculée
        </div>
      </div>

      {/* Number of Sales */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium">Ventes Effectuées</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
          {totalSalesCount} <span className="text-xs font-bold text-slate-400">tickets</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Transactions validées
        </div>
      </div>

      {/* Average Basket */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium">Panier Moyen</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
          {averageBasket.toFixed(2)} <span className="text-xs font-bold text-slate-400">DH</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Moyenne par client
        </div>
      </div>
    </div>
  );
}