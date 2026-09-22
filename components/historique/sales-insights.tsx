'use client';

import { useTranslation } from 'react-i18next';
import { SaleWithItems } from './sales-list';
import {
  TbTrophy,
  TbTrendingUp,
  TbChartPie,
  TbStack2,
  TbSparkles,
} from 'react-icons/tb';

interface SalesInsightsProps {
  sales: SaleWithItems[];
}

export function SalesInsights({ sales }: SalesInsightsProps) {
  const { t } = useTranslation();
  const completedSales = sales.filter((s) => s.status !== 'cancelled');

  const productMap = new Map<
    string,
    { name: string; quantity: number; revenue: number; profit: number }
  >();

  const categoryMap = new Map<
    string,
    { name: string; revenue: number; count: number }
  >();

  let totalPeriodRevenue = 0;
  let totalPeriodProfit = 0;

  completedSales.forEach((sale) => {
    totalPeriodRevenue += sale.total_amount;

    sale.items.forEach((item: any) => {
      const itemMargin =
        (item.unit_sell_price - item.unit_buy_price) * item.quantity;
      totalPeriodProfit += itemMargin;

      const existingProd = productMap.get(item.product_name) || {
        name: item.product_name,
        quantity: 0,
        revenue: 0,
        profit: 0,
      };
      existingProd.quantity += item.quantity;
      existingProd.revenue += item.total_price;
      existingProd.profit += itemMargin;
      productMap.set(item.product_name, existingProd);

      const catName =
        item.product?.category?.name ||
        (item.product_id ? 'Général' : 'Services / Vente Libre');

      const existingCat = categoryMap.get(catName) || {
        name: catName,
        revenue: 0,
        count: 0,
      };
      existingCat.revenue += item.total_price;
      existingCat.count += item.quantity;
      categoryMap.set(catName, existingCat);
    });
  });

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const topProfitableProduct = Array.from(productMap.values())
    .sort((a, b) => b.profit - a.profit)[0];

  const categories = Array.from(categoryMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  if (completedSales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-neutral-200/90 bg-white">
        <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
          <TbChartPie className="h-6 w-6 stroke-[1.8]" />
        </div>
        <h3 className="text-sm font-bold text-neutral-900">
          {t('history.notEnoughData')}
        </h3>
        <p className="mt-1 text-xs text-neutral-400">
          {t('history.notEnoughDataSub')}
        </p>
      </div>
    );
  }

  const categoryColors = [
    'bg-emerald-600',
    'bg-neutral-900',
    'bg-amber-500',
    'bg-blue-600',
    'bg-purple-600',
    'bg-rose-500',
  ];

  return (
    <div className="space-y-4">
      {topProfitableProduct && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-3xl border border-amber-200/80 bg-linear-to-r from-amber-50/80 via-white to-amber-50/40 p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
              <TbSparkles className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                {t('history.starProductBadge')}
              </span>
              <h3 className="text-base font-black tracking-tight text-neutral-900">
                {topProfitableProduct.name}
              </h3>
            </div>
          </div>

          <div className="flex items-baseline gap-4 text-end">
            <div>
              <div className="text-[10px] text-neutral-400 font-bold uppercase">{t('history.volume')}</div>
              <div className="text-sm font-black text-neutral-900">
                {topProfitableProduct.quantity} {t('history.soldUnits')}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase">{t('history.netProfit')}</div>
              <div className="text-lg font-black text-emerald-700">
                +{topProfitableProduct.profit.toFixed(2)} {t('common.dh')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Products */}
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                <TbTrophy className="h-4 w-4 stroke-[2.2]" />
              </div>
              <h3 className="font-extrabold text-neutral-900 text-sm">
                {t('history.top5Sellers')}
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-medium">{t('history.byVolume')}</span>
          </div>

          <div className="space-y-2.5">
            {topProducts.map((prod, index) => {
              const rankColor =
                index === 0
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : index === 1
                  ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
                  : index === 2
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-neutral-50 text-neutral-500 border-neutral-200';

              return (
                <div
                  key={prod.name}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black border ${rankColor}`}
                    >
                      #{index + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-xs text-neutral-900 truncate">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-medium">
                        {prod.quantity} {t('common.units')} • {prod.revenue.toFixed(2)} {t('common.dh')}
                      </div>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                      +{prod.profit.toFixed(2)} {t('common.dh')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <TbStack2 className="h-4 w-4 stroke-[2.2]" />
              </div>
              <h3 className="font-extrabold text-neutral-900 text-sm">
                {t('history.revenueDistribution')}
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-medium">{t('history.byCategory')}</span>
          </div>

          <div className="space-y-4">
            {categories.map((cat, idx) => {
              const percentage =
                totalPeriodRevenue > 0
                  ? (cat.revenue / totalPeriodRevenue) * 100
                  : 0;

              const barColor = categoryColors[idx % categoryColors.length];

              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-neutral-800">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-neutral-900">
                        {cat.revenue.toFixed(2)} {t('common.dh')}
                      </span>
                      <span className="text-[11px] font-bold text-neutral-400">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}