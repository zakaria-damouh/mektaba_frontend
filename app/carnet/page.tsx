'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  TbUserPlus,
  TbSearch,
  TbNotebook,
  TbCurrencyDirham,
  TbAlertCircle,
  TbUsers,
  TbBrandWhatsapp,
  TbCoins,
  TbHistory,
  TbPencil,
  TbLoader2,
  TbPhone,
  TbX,
} from 'react-icons/tb';

import { CustomerDialog } from '@/components/carnet/customer-dialog';
import { PaymentDialog } from '@/components/carnet/payment-dialog';
import { CustomerHistoryDialog } from '@/components/carnet/customer-history-dialog';

type FilterTab = 'all' | 'debtors' | 'cleared';

export default function CarnetPage() {
  const supabase = createClient();

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('debtors');

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

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <TbNotebook className="h-7 w-7 text-emerald-600 stroke-[2.2]" />
            Le Carnet de Dette
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Gestion du crédit client, encaissements et rappels WhatsApp
          </p>
        </div>

        {/* Airbnb Pill Action Button */}
        <Button
          onClick={() => {
            setCustomerToEdit(null);
            setIsCustomerDialogOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 py-2.5 text-xs font-bold shadow-sm shadow-emerald-600/20 hover:scale-102 transition-all cursor-pointer"
        >
          <TbUserPlus className="h-4 w-4 stroke-[2.5]" />
          Nouveau Client
        </Button>
      </div>

      {/* ======================================================== */}
      {/* AIRBNB-STYLE KPI METRIC CARDS                            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Total Debt */}
        <div className="flex flex-col justify-between rounded-3xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Total Dettes Détenues
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200/60 shadow-xs">
              <TbCurrencyDirham className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-rose-600">
              {totalDebt.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              <span className="text-xs font-bold text-rose-400">DH</span>
            </div>
            <div className="mt-1 text-[11px] text-rose-800/80 font-medium">
              Argent à récupérer dans le quartier
            </div>
          </div>
        </div>

        {/* Debtor Clients Count */}
        <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Clients Débiteurs
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs">
              <TbUsers className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
              {debtorsCount}{' '}
              <span className="text-xs font-bold text-neutral-400">clients</span>
            </div>
            <div className="mt-1 text-[11px] text-neutral-400 font-medium">
              sur {customers.length} clients enregistrés
            </div>
          </div>
        </div>

        {/* Top Debtor */}
        <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Plus Forte Dette
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
              <TbAlertCircle className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-black text-neutral-900 truncate">
              {topDebtor ? topDebtor.name : 'Aucun débiteur'}
            </div>
            <div className="mt-0.5 text-sm font-black text-rose-600">
              {topDebtor ? `${topDebtor.current_debt.toFixed(2)} DH` : '0.00 DH'}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEARCH CAPSULE & SEGMENTED TABS                          */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Capsule */}
        <div className="flex-1 flex items-center rounded-full border border-neutral-200/90 bg-white p-1 pl-4 shadow-xs hover:shadow-sm transition-all focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10">
          <TbSearch className="h-4 w-4 shrink-0 text-neutral-400 stroke-[2.2]" />
          <input
            type="text"
            placeholder="Rechercher par nom de client ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent px-2 text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer mr-1"
            >
              <TbX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Filter Pills */}
        <div className="inline-flex h-10 items-center rounded-full border border-neutral-200/90 bg-white p-1 shadow-xs shrink-0">
          <button
            type="button"
            onClick={() => setFilterTab('debtors')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'debtors'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Avec Dette ({debtorsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Tous ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('cleared')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'cleared'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            À Jour (0 DH)
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CUSTOMER CARDS GRID                                      */}
      {/* ======================================================== */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-neutral-200/90 bg-white">
          <TbLoader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-neutral-200/90 bg-white">
          <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
            <TbNotebook className="h-6 w-6 stroke-[1.8]" />
          </div>
          <p className="text-xs font-bold text-neutral-700">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredCustomers.map((customer) => {
            const hasDebt = customer.current_debt > 0;

            return (
              <div
                key={customer.id}
                className="group flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-neutral-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                        {customer.name}
                      </h3>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mt-1">
                          <TbPhone className="h-3.5 w-3.5 text-neutral-400 stroke-[2]" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Balance Pill */}
                    {hasDebt ? (
                      <Badge className="rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 font-black text-xs px-3 py-1 shadow-2xs">
                        {customer.current_debt.toFixed(2)} DH
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs px-3 py-1">
                        À jour
                      </Badge>
                    )}
                  </div>

                  {customer.notes && (
                    <p className="text-xs text-neutral-400 italic mt-2.5 line-clamp-2 leading-relaxed">
                      {customer.notes}
                    </p>
                  )}
                </div>

                {/* Actions Bottom Bar */}
                <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-neutral-400">
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryCustomer(customer);
                        setIsHistoryOpen(true);
                      }}
                      className="p-2 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                      title="Historique du carnet"
                    >
                      <TbHistory className="h-4 w-4 stroke-[2.2]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomerToEdit(customer);
                        setIsCustomerDialogOpen(true);
                      }}
                      className="p-2 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                      title="Modifier les infos"
                    >
                      <TbPencil className="h-4 w-4 stroke-[2.2]" />
                    </button>

                    {customer.phone && hasDebt && (
                      <button
                        type="button"
                        onClick={() => handleSendWhatsAppReminder(customer)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                        title="Envoyer un rappel poli sur WhatsApp"
                      >
                        <TbBrandWhatsapp className="h-4 w-4 stroke-[2.2]" />
                      </button>
                    )}
                  </div>

                  {/* Encaisser Button */}
                  {hasDebt && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setPaymentCustomer(customer);
                        setIsPaymentOpen(true);
                      }}
                      className="h-8 rounded-full px-4 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm shadow-emerald-600/20 cursor-pointer"
                    >
                      <TbCoins className="h-3.5 w-3.5 stroke-[2.2]" />
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