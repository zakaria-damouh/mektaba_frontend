'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SalesStats } from '@/components/historique/sales-stats';
import { SalesList, SaleWithItems } from '@/components/historique/sales-list';
import { SalesInsights } from '@/components/historique/sales-insights';
import { CloseRegisterDialog } from '@/components/historique/close-register-dialog';
import { exportSalesToCSV } from '@/lib/export-csv';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  FileCheck,
  Search,
  Banknote,
  CreditCard,
  Building,
  BookOpen,
  X,
  RotateCcw,
  BarChart3,
  Receipt,
  Download,
} from 'lucide-react';

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
    exportSalesToCSV(sales, labelMap[filterPeriod]);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Historique & Clôture
          </h1>
          <p className="text-sm text-slate-500">
            Consultez les ventes, marges et tickets de caisse
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterPeriod('today')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
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
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
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
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filterPeriod === 'month'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ce Mois
            </button>
          </div>

          {/* Export Excel Button */}
          <Button
            variant="outline"
            onClick={handleExport}
            className="h-10 gap-1.5 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold shadow-xs cursor-pointer"
            title="Télécharger le journal des ventes en format Excel / CSV"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </Button>

          {/* Ticket Z Button */}
          <Button
            onClick={() => setIsCloseRegisterOpen(true)}
            className="h-10 gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
          >
            <FileCheck className="h-4 w-4 text-emerald-400" />
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

      {/* VIEW SWITCHER TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveView('tickets')}
          className={`flex items-center gap-2 py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeView === 'tickets'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Liste des Tickets ({filteredSales.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('insights')}
          className={`flex items-center gap-2 py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeView === 'insights'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Statistiques & Top Ventes</span>
        </button>
      </div>

      {/* VIEW 1: TICKETS LIST */}
      {activeView === 'tickets' && (
        <div className="space-y-4">
          {/* Search & Filters Toolbar */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Rechercher par N° de ticket, client, ou article vendu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-slate-50 border-slate-200 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">
                  Règlement :
                </span>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('all')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tous
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('cash')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'cash'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Banknote className="h-3 w-3" /> Espèces
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('credit')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'credit'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="h-3 w-3" /> Crédit
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('card')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'card'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CreditCard className="h-3 w-3" /> Carte
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('transfer')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'transfer'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Building className="h-3 w-3" /> Virement
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === 'cancelled' ? 'all' : 'cancelled'
                    )
                  }
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer border ${
                    statusFilter === 'cancelled'
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <RotateCcw className="h-3 w-3" />
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

      {/* VIEW 2: BUSINESS INSIGHTS & TOP VENTES */}
      {activeView === 'insights' && <SalesInsights sales={sales} />}
    </div>
  );
}