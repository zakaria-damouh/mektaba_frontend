'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Search,
  BookOpen,
  DollarSign,
  AlertCircle,
  Users,
  MessageCircle,
  Coins,
  History,
  Pencil,
  Loader2,
  Phone,
} from 'lucide-react';

import { CustomerDialog } from '@/components/carnet/customer-dialog';
import { PaymentDialog } from '@/components/carnet/payment-dialog';
import { CustomerHistoryDialog } from '@/components/carnet/customer-history-dialog';

type FilterTab = 'all' | 'debtors' | 'cleared';

export default function CarnetPage() {
  const supabase = createClient();

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('debtors'); // Default to clients with debt!

  // Dialog States
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Fetch Customers
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('current_debt', { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });

  // KPI Calculations
  const totalDebt = customers.reduce((sum, c) => sum + c.current_debt, 0);
  const debtorsCount = customers.filter((c) => c.current_debt > 0).length;
  const topDebtor = customers.find((c) => c.current_debt > 0);

  // Filter Logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));

    let matchesTab = true;
    if (filterTab === 'debtors') matchesTab = c.current_debt > 0;
    if (filterTab === 'cleared') matchesTab = c.current_debt === 0;

    return matchesSearch && matchesTab;
  });

  // 1-Click WhatsApp Reminder Function
  const handleSendWhatsAppReminder = (customer: Customer) => {
    if (!customer.phone) {
      alert("Ce client n'a pas de numéro de téléphone enregistré.");
      return;
    }

    const message = `Salam Si ${customer.name},\nMaktaba vous informe que le solde restant sur votre carnet est de *${customer.current_debt.toFixed(2)} DH*.\nMerci de passer à votre convenance pour le règlement.\n_Maktaba POS_`;

    let cleanPhone = customer.phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = `212${cleanPhone.substring(1)}`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Modals */}
      <CustomerDialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
        customerToEdit={customerToEdit}
      />

      <PaymentDialog
        customer={paymentCustomer}
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
      />

      <CustomerHistoryDialog
        customer={historyCustomer}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Le Carnet de Dette
          </h1>
          <p className="text-sm text-slate-500">
            Gestion du crédit client, encaissements et rappels WhatsApp
          </p>
        </div>

        <Button
          onClick={() => {
            setCustomerToEdit(null);
            setIsCustomerDialogOpen(true);
          }}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Nouveau Client
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Debt */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Dettes Détenues
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {totalDebt.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xs font-bold text-rose-400">DH</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-700 font-medium">
            Argent à récupérer dans le quartier
          </div>
        </div>

        {/* Debtor Clients Count */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Clients Débiteurs
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {debtorsCount}{' '}
            <span className="text-xs font-bold text-slate-400">clients</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            sur {customers.length} clients enregistrés
          </div>
        </div>

        {/* Top Debtor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Plus Forte Dette
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900 truncate">
            {topDebtor ? topDebtor.name : 'Aucun'}
          </div>
          <div className="mt-0.5 text-sm font-black text-rose-600">
            {topDebtor ? `${topDebtor.current_debt.toFixed(2)} DH` : '0.00 DH'}
          </div>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher par nom ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="inline-flex h-10 items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setFilterTab('debtors')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'debtors'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Avec Dette ({debtorsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tous ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('cleared')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'cleared'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            À Jour (0 DH)
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border bg-white">
          <BookOpen className="h-10 w-10 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500 font-medium">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredCustomers.map((customer) => {
            const hasDebt = customer.current_debt > 0;

            return (
              <div
                key={customer.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {customer.name}
                      </h3>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {customer.phone}
                        </div>
                      )}
                    </div>

                    {hasDebt ? (
                      <Badge variant="destructive" className="bg-rose-500 font-black text-xs font-semibold text-white">
                        {customer.current_debt.toFixed(2)} DH
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                        À jour
                      </Badge>
                    )}
                  </div>

                  {customer.notes && (
                    <p className="text-xs text-slate-400 italic mt-2 line-clamp-2">
                      {customer.notes}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryCustomer(customer);
                        setIsHistoryOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Historique du carnet"
                    >
                      <History className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomerToEdit(customer);
                        setIsCustomerDialogOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Modifier les infos"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {customer.phone && hasDebt && (
                      <button
                        type="button"
                        onClick={() => handleSendWhatsAppReminder(customer)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Envoyer un rappel poli sur WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Pay button */}
                  {hasDebt && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setPaymentCustomer(customer);
                        setIsPaymentOpen(true);
                      }}
                      className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      <Coins className="h-3.5 w-3.5" />
                      Encaisser
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}