'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SalesStats } from '@/components/historique/sales-stats';
import { SalesList, SaleWithItems } from '@/components/historique/sales-list';
import { Calendar } from 'lucide-react';

type DateFilter = 'today' | 'week' | 'month';

export default function HistoriquePage() {
  const supabase = createClient();
  const [filterPeriod, setFilterPeriod] = useState<DateFilter>('today');

  // Query sales with line items included
  const { data: sales = [], isLoading } = useQuery<SaleWithItems[]>({
    queryKey: ['sales-history', filterPeriod],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select('*, items:sale_items(*)')
        .order('created_at', { ascending: false });

      const now = new Date();

      if (filterPeriod === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', startOfDay);
      } else if (filterPeriod === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        query = query.gte('created_at', startOfWeek.toISOString());
      } else if (filterPeriod === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte('created_at', startOfMonth);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SaleWithItems[];
    },
  });

  // Calculate high-level financial metrics
  const totalRevenue = sales.reduce((acc, s) => acc + s.total_amount, 0);

  const totalProfit = sales.reduce((acc, sale) => {
    const saleProfit = sale.items.reduce((itemAcc, item) => {
      return itemAcc + (item.unit_sell_price - item.unit_buy_price) * item.quantity;
    }, 0) - sale.discount_amount;
    return acc + saleProfit;
  }, 0);

  const cashTotal = sales
    .filter((s) => s.payment_method === 'cash')
    .reduce((acc, s) => acc + s.total_amount, 0);

  const cardTotal = sales
    .filter((s) => s.payment_method === 'card')
    .reduce((acc, s) => acc + s.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Historique & Clôture
          </h1>
          <p className="text-sm text-slate-500">
            Consultez les ventes et les marges réalisées
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setFilterPeriod('today')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterPeriod === 'today'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => setFilterPeriod('week')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterPeriod === 'week'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Derniers Jours
          </button>
          <button
            type="button"
            onClick={() => setFilterPeriod('month')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterPeriod === 'month'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ce Mois
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <SalesStats
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        totalSalesCount={sales.length}
        cashTotal={cashTotal}
        cardTotal={cardTotal}
      />

      {/* Receipts List */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" />
          Détail des Transactions ({sales.length})
        </h2>
        <SalesList sales={sales} isLoading={isLoading} />
      </div>
    </div>
  );
}