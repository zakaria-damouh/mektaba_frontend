'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SalesStats } from '@/components/historique/sales-stats';
import { SalesList, SaleWithItems } from '@/components/historique/sales-list';
import { SalesInsights } from '@/components/historique/sales-insights';
import { CloseRegisterDialog } from '@/components/historique/close-register-dialog';
import { exportSalesToExcel } from '@/lib/export-excel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TbCalendar,
  TbFileCheck,
  TbSearch,
  TbCash,
  TbCreditCard,
  TbBuildingBank,
  TbNotebook,
  TbX,
  TbRotate,
  TbChartBar,
  TbReceipt,
  TbDownload,
} from 'react-icons/tb';

type DateFilter = 'today' | 'week' | 'month';
type PaymentFilter = 'all' | 'cash' | 'card' | 'transfer' | 'credit';
type StatusFilter = 'all' | 'completed' | 'cancelled';
type ActiveView = 'tickets' | 'insights';

export default function HistoriquePage() {
  const supabase = createClient();

  // View & Filters State
  const [activeView, setActiveView] = useState<ActiveView>('tickets');
  const [filterPeriod, setFilterPeriod] = useState<DateFilter>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Dialog State
  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState(false);

  // Query sales
  const { data: sales = [], isLoading } = useQuery<SaleWithItems[]>({
    queryKey: ['sales-history', filterPeriod],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(
          '*, customer:customers(id, name, phone), items:sale_items(*, product:products(category:categories(name)))'
        )
        .order('created_at', { ascending: false });

      const now = new Date();

      if (filterPeriod === 'today') {
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).toISOString();
        query = query.gte('created_at', startOfDay);
      } else if (filterPeriod === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        query = query.gte('created_at', startOfWeek.toISOString());
      } else if (filterPeriod === 'month') {
        const startOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ).toISOString();
        query = query.gte('created_at', startOfMonth);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SaleWithItems[];
    },
  });

  const completedSales = sales.filter((s) => s.status !== 'cancelled');

  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total_amount, 0);

  const totalProfit = completedSales.reduce((acc, sale) => {
    const saleProfit =
      sale.items.reduce((itemAcc, item) => {
        return itemAcc + (item.unit_sell_price - item.unit_buy_price) * item.quantity;
      }, 0) - sale.discount_amount;
    return acc + saleProfit;
  }, 0);

  const cashTotal = completedSales
    .filter((s) => s.payment_method === 'cash')
    .reduce((acc, s) => acc + s.total_amount, 0);

  const cardTotal = completedSales
    .filter((s) => s.payment_method === 'card')
    .reduce((acc, s) => acc + s.total_amount, 0);

  // Filter list logic
  const filteredSales = sales.filter((sale) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesTicketNumber = sale.receipt_number.toString().includes(query);
    const matchesCustomer = sale.customer?.name.toLowerCase().includes(query) || false;
    const matchesItems = sale.items.some((item) =>
      item.product_name.toLowerCase().includes(query)
    );

    const matchesSearch =
      query === '' || matchesTicketNumber || matchesCustomer || matchesItems;

    const matchesPayment =
      paymentFilter === 'all' || sale.payment_method === paymentFilter;

    let matchesStatus = true;
    if (statusFilter === 'completed') matchesStatus = sale.status === 'completed';
    if (statusFilter === 'cancelled') matchesStatus = sale.status === 'cancelled';

    return matchesSearch && matchesPayment && matchesStatus;
  });

  const handleExport = () => {
    const labelMap: Record<DateFilter, string> = {
      today: 'aujourdhui',
      week: 'semaine',
      month: 'mois',
    };
    exportSalesToExcel(sales, labelMap[filterPeriod]);
  };

  return (
    <div className="space-y-6">
      {/* End of Day Z-Report Dialog */}
      <CloseRegisterDialog
        open={isCloseRegisterOpen}
        onOpenChange={setIsCloseRegisterOpen}
        todaySales={sales}
      />

      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900">
            Historique & Clôture
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Consultez les ventes, marges et tickets de caisse
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Period Selector */}
          <div className="inline-flex items-center rounded-full border border-neutral-200/90 bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setFilterPeriod('today')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterPeriod === 'today'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setFilterPeriod('week')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterPeriod === 'week'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              7 Derniers Jours
            </button>
            <button
              type="button"
              onClick={() => setFilterPeriod('month')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterPeriod === 'month'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Ce Mois
            </button>
          </div>

          {/* Export Excel Button */}
          <Button
            variant="outline"
            onClick={handleExport}
            className="h-10 rounded-full px-4 gap-1.5 border-neutral-200/90 hover:bg-neutral-50 text-neutral-800 font-bold text-xs shadow-xs hover:shadow-sm cursor-pointer"
            title="Télécharger le journal des ventes en format Excel"
          >
            <TbDownload className="h-4 w-4 text-emerald-600 stroke-[2.2]" />
            <span className="hidden sm:inline">Export Excel</span>
          </Button>

          {/* Ticket Z Button */}
          <Button
            onClick={() => setIsCloseRegisterOpen(true)}
            className="h-10 rounded-full px-5 gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-xs hover:scale-101 active:scale-[0.99] transition-all cursor-pointer"
          >
            <TbFileCheck className="h-4 w-4 text-emerald-400 stroke-[2.2]" />
            <span>Clôture (Ticket Z)</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <SalesStats
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        totalSalesCount={completedSales.length}
        cashTotal={cashTotal}
        cardTotal={cardTotal}
      />

      {/* ======================================================== */}
      {/* SEGMENTED VIEW SWITCHER: Tickets vs Insights             */}
      {/* ======================================================== */}
      <div className="inline-flex items-center rounded-full border border-neutral-200/90 bg-white p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveView('tickets')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeView === 'tickets'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <TbReceipt className="h-4 w-4 stroke-[2.2]" />
          <span>Liste des Tickets ({filteredSales.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('insights')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeView === 'insights'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <TbChartBar className="h-4 w-4 stroke-[2.2]" />
          <span>Statistiques & Top Ventes</span>
        </button>
      </div>

      {/* VIEW 1: TICKETS LIST */}
      {activeView === 'tickets' && (
        <div className="space-y-4">
          {/* Search & Filters Capsule Bar */}
          <div className="space-y-3 rounded-3xl border border-neutral-200/90 bg-white p-4 shadow-xs">
            {/* Search Capsule */}
            <div className="flex items-center rounded-full border border-neutral-200/90 bg-white p-1 pl-4 shadow-xs hover:shadow-sm transition-all focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10">
              <TbSearch className="h-4 w-4 shrink-0 text-neutral-400 stroke-[2.2]" />
              <input
                type="text"
                placeholder="Rechercher par N° de ticket (ex: 12), nom de client, ou article vendu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-2 text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer mr-1"
                >
                  <TbX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
                  Règlement :
                </span>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('all')}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'all'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Tous
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('cash')}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'cash'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <TbCash className="h-3.5 w-3.5" /> Espèces
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('credit')}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'credit'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <TbNotebook className="h-3.5 w-3.5" /> Crédit
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('card')}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'card'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <TbCreditCard className="h-3.5 w-3.5" /> Carte
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('transfer')}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'transfer'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <TbBuildingBank className="h-3.5 w-3.5" /> Virement
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === 'cancelled' ? 'all' : 'cancelled'
                    )
                  }
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer border ${
                    statusFilter === 'cancelled'
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <TbRotate className="h-3.5 w-3.5" />
                  <span>
                    Annulés ({sales.filter((s) => s.status === 'cancelled').length})
                  </span>
                </button>
              </div>
            </div>
          </div>

          <SalesList sales={filteredSales} isLoading={isLoading} />
        </div>
      )}

      {/* VIEW 2: BUSINESS INSIGHTS */}
      {activeView === 'insights' && <SalesInsights sales={sales} />}
    </div>
  );
}