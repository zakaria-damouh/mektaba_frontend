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
import { Badge } from '@/components/ui/badge';
import {
  Receipt,
  Coins,
  Calendar,
  Clock,
  Package,
  Loader2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

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

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['customer-history', customer?.id],
    enabled: Boolean(customer && open),
    queryFn: async () => {
      if (!customer) return [];

      // 1. Fetch Sales made on credit
      const { data: sales } = await supabase
        .from('sales')
        .select('*, items:sale_items(*)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      // 2. Fetch Payments made
      const { data: payments } = await supabase
        .from('debt_payments')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      // Merge and sort by date descending
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
      <DialogContent className="max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Relevé du Carnet
              </DialogTitle>
              <p className="text-xs text-slate-400">
                Client : <span className="font-bold text-slate-800">{customer.name}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400">Reste Dû</span>
              <div className="text-lg font-black text-rose-600">
                {customer.current_debt.toFixed(2)} DH
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Receipt className="h-8 w-8 mx-auto text-slate-300" />
              <p className="mt-2 text-xs">Aucune opération enregistrée pour ce client.</p>
            </div>
          ) : (
            history.map((record) => {
              if (record.type === 'SALE') {
                return (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900">
                            Achat à Crédit (Ticket #{record.receiptNumber})
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="h-2.5 w-2.5" />
                            {formatDate(record.date)}
                          </div>
                        </div>
                      </div>
                      <span className="font-black text-sm text-rose-600">
                        +{record.amount.toFixed(2)} DH
                      </span>
                    </div>

                    {/* Items taken */}
                    {record.items.length > 0 && (
                      <div className="bg-white rounded-xl p-2 border border-rose-100 text-xs text-slate-600 space-y-1">
                        {record.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-[11px]">
                            <span className="truncate">
                              • {item.quantity}x {item.product_name}
                            </span>
                            <span className="font-semibold text-slate-800 ml-2 shrink-0">
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
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900">
                          Règlement ({record.method})
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDate(record.date)}
                        </div>
                        {record.notes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            Note : {record.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="font-black text-sm text-emerald-600">
                      -{record.amount.toFixed(2)} DH
                    </span>
                  </div>
                );
              }
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}