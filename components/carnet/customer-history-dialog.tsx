'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Customer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  TbReceipt,
  TbCoins,
  TbClock,
  TbPackage,
  TbLoader2,
  TbTrendingDown,
  TbTrendingUp,
} from 'react-icons/tb';

interface CustomerHistoryDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerHistoryDialog({
  customer,
  open,
  onOpenChange,
}: CustomerHistoryDialogProps) {
  const supabase = createClient();

  // All Hooks declared first
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['customer-history', customer?.id],
    enabled: Boolean(customer && open),
    queryFn: async () => {
      if (!customer) return [];

      // 1. Fetch Sales on credit
      const { data: sales } = await supabase
        .from('sales')
        .select('*, items:sale_items(*)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      // 2. Fetch Repayments
      const { data: payments } = await supabase
        .from('debt_payments')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      // Format & merge
      const formattedSales = (sales || []).map((s) => ({
        type: 'SALE' as const,
        id: s.id,
        date: s.created_at,
        amount: s.total_amount,
        receiptNumber: s.receipt_number,
        items: s.items || [],
        notes: s.notes,
      }));

      const formattedPayments = (payments || []).map((p) => ({
        type: 'PAYMENT' as const,
        id: p.id,
        date: p.created_at,
        amount: p.amount,
        method: p.payment_method,
        notes: p.notes,
      }));

      return [...formattedSales, ...formattedPayments].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
  });

  if (!customer) return null;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200/90 max-h-[85vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
                <TbCoins className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <DialogTitle className="text-base font-black tracking-tight text-neutral-900">
                  Relevé du Carnet
                </DialogTitle>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Client : <span className="font-extrabold text-neutral-800">{customer.name}</span>
                </p>
              </div>
            </div>

            {/* Outstanding Balance Badge */}
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Reste Dû
              </span>
              <div className="text-lg font-black text-rose-600 leading-tight">
                {customer.current_debt.toFixed(2)}{' '}
                <span className="text-[10px] font-bold text-rose-400">DH</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <TbLoader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-14 text-center text-neutral-400">
              <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-300 mx-auto mb-2">
                <TbReceipt className="h-6 w-6 stroke-[1.8]" />
              </div>
              <p className="text-xs font-medium">Aucune opération enregistrée pour ce client.</p>
            </div>
          ) : (
            history.map((record) => {
              if (record.type === 'SALE') {
                return (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 border border-rose-200/60">
                          <TbTrendingUp className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-neutral-900">
                            Achat à Crédit (Ticket #{record.receiptNumber})
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                            <TbClock className="h-3 w-3 stroke-[2]" />
                            {formatDate(record.date)}
                          </div>
                        </div>
                      </div>
                      <span className="font-black text-sm text-rose-600">
                        +{record.amount.toFixed(2)} DH
                      </span>
                    </div>

                    {/* Items taken box */}
                    {record.items.length > 0 && (
                      <div className="bg-white rounded-xl p-2.5 border border-rose-100/80 text-xs text-neutral-700 space-y-1">
                        {record.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-baseline text-[11px]">
                            <span className="truncate font-medium">
                              • {item.quantity}x {item.product_name}
                            </span>
                            <span className="font-black text-neutral-900 ml-2 shrink-0">
                              {item.total_price.toFixed(2)} DH
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                        <TbTrendingDown className="h-4 w-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-neutral-900">
                          Règlement ({record.method.toUpperCase()})
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                          <TbClock className="h-3 w-3 stroke-[2]" />
                          {formatDate(record.date)}
                        </div>
                        {record.notes && (
                          <div className="text-[10px] text-neutral-500 italic mt-0.5">
                            Note : {record.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="font-black text-sm text-emerald-700">
                      -{record.amount.toFixed(2)} DH
                    </span>
                  </div>
                );
              }
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-100 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-5 text-xs font-bold border-neutral-200 hover:bg-neutral-100"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}