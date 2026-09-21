'use client';

import { SaleWithItems } from './sales-list';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  TrendingUp,
  PieChart,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SalesInsightsProps {
  sales: SaleWithItems[];
}

export function SalesInsights({ sales }: SalesInsightsProps) {
  // Only analyze completed (non-cancelled) sales
  const completedSales = sales.filter((s) => s.status !== 'cancelled');

  // ==========================================
  // 1. AGGREGATE TOP PRODUCTS
  // ==========================================
  const productMap = new Map<
    string,
    { name: string; quantity: number; revenue: number; profit: number }
  >();

  // ==========================================
  // 2. AGGREGATE CATEGORIES
  // ==========================================
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

      // Group product
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

      // Group category
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
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-slate-200 bg-white">
        <PieChart className="h-12 w-12 text-slate-300" />
        <h3 className="mt-2 text-sm font-bold text-slate-900">
          Pas assez de données
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Enregistrez des ventes pour afficher les statistiques et le classement.
        </p>
      </div>
    );
  }

  const categoryColors = [
    'bg-indigo-600',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-rose-500',
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner: Most Profitable Star Product */}
      {topProfitableProduct && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50/80 via-white to-amber-50/40 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                Article Star de la Période (Plus Gros Bénéfice)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {topProfitableProduct.name}
              </h3>
            </div>
          </div>

          <div className="flex items-baseline gap-3 text-right">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">Volume</div>
              <div className="text-xs font-black text-slate-900">
                {topProfitableProduct.quantity} vendus
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-600 font-semibold">Bénéfice Net</div>
              <div className="text-base font-black text-emerald-600">
                +{topProfitableProduct.profit.toFixed(2)} DH
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Columns Grid: Top 5 Sellers + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Column 1: Top 5 Best Selling Items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">
                Top 5 Articles les Plus Vendus
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Par volume</span>
          </div>

          <div className="space-y-3">
            {topProducts.map((prod, index) => {
              const rankColor =
                index === 0
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : index === 1
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : index === 2
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200';

              return (
                <div
                  key={prod.name}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black border ${rankColor}`}
                    >
                      #{index + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {prod.quantity} unités • {prod.revenue.toFixed(2)} DH total
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      +{prod.profit.toFixed(2)} DH
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Répartition du Chiffre d'Affaires
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Par catégorie</span>
          </div>

          <div className="space-y-3.5">
            {categories.map((cat, idx) => {
              const percentage =
                totalPeriodRevenue > 0
                  ? (cat.revenue / totalPeriodRevenue) * 100
                  : 0;

              const barColor = categoryColors[idx % categoryColors.length];

              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-800">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {cat.revenue.toFixed(2)} DH
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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