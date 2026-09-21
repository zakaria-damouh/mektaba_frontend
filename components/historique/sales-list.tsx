'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  ChevronUp,
  Receipt,
  Banknote,
  CreditCard,
  Building,
  Clock,
  Package,
  RotateCcw,
  AlertTriangle,
  Loader2,
  BookOpen,
  Printer,
  Share2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ReceiptDialog, CompletedSaleData } from '@/components/caisse/receipt-dialog';

export interface SaleWithItems {
  id: string;
  receipt_number: number;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  status: 'completed' | 'cancelled';
  cancelled_at: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  created_at: string;
  customer?: { id: string; name: string; phone?: string | null } | null;
  items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_buy_price: number;
    unit_sell_price: number;
    total_price: number;
  }[];
}

interface SalesListProps {
  sales: SaleWithItems[];
  isLoading: boolean;
}

export function SalesList({ sales, isLoading }: SalesListProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  // Reprint / WhatsApp State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [saleForReceipt, setSaleForReceipt] = useState<CompletedSaleData | null>(null);

  // Cancellation State
  const [saleToCancel, setSaleToCancel] = useState<SaleWithItems | null>(null);
  const [cancelReason, setCancelReason] = useState('Retour article / Erreur de caisse');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedSaleId((prev) => (prev === id ? null : id));
  };

  const handleOpenReceiptModal = (sale: SaleWithItems) => {
    const formattedData: CompletedSaleData = {
      receiptNumber: sale.receipt_number,
      items: sale.items.map((i) => ({
        name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_sell_price,
        total: i.total_price,
      })),
      subtotal: sale.subtotal,
      discount: sale.discount_amount,
      total: sale.total_amount,
      paymentMethod: sale.payment_method,
      date: new Date(sale.created_at),
      status: sale.status,
      cancellationReason: sale.cancellation_reason,
      customerName: sale.customer?.name || null,
      customerPhone: sale.customer?.phone || null,
    };

    setSaleForReceipt(formattedData);
    setIsReceiptOpen(true);
  };

  const cancelSaleMutation = useMutation({
    mutationFn: async ({ saleId, reason }: { saleId: string; reason: string }) => {
      const { error } = await supabase.rpc('cancel_sale', {
        p_sale_id: saleId,
        p_reason: reason.trim() || 'Retour article',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsCancelDialogOpen(false);
      setSaleToCancel(null);
    },
    onError: (err: any) => {
      alert(`Erreur: ${err.message}`);
    },
  });

  const handleOpenCancel = (e: React.MouseEvent, sale: SaleWithItems) => {
    e.stopPropagation();
    setSaleToCancel(sale);
    setCancelReason('Retour article / Erreur de caisse');
    setIsCancelDialogOpen(true);
  };

  const formatTime = (dateStr: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(new Date(dateStr));
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-3.5 w-3.5" />;
      case 'transfer':
        return <Building className="h-3.5 w-3.5" />;
      case 'credit':
        return <BookOpen className="h-3.5 w-3.5" />;
      default:
        return <Banknote className="h-3.5 w-3.5" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Carte';
      case 'transfer':
        return 'Virement';
      case 'credit':
        return 'Crédit';
      default:
        return 'Espèces';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-400">Chargement de l'historique...</p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-slate-200 bg-white">
        <Receipt className="h-12 w-12 text-slate-300" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900">Aucune vente enregistrée</h3>
        <p className="mt-1 text-xs text-slate-500">
          Les ventes validées depuis la caisse apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Reprint / WhatsApp Dialog */}
      <ReceiptDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        saleData={saleForReceipt}
      />

      {/* Cancellation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="max-w-md bg-white rounded-3xl p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                Annuler le Ticket #{saleToCancel?.receipt_number} ?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-slate-600 pt-1 space-y-2">
              <p>
                Cette action va <strong>réintégrer automatiquement les articles</strong> dans votre stock physique et déduire{' '}
                <strong className="text-slate-900">{saleToCancel?.total_amount.toFixed(2)} DH</strong> du total de la journée.
              </p>
              {saleToCancel?.payment_method === 'credit' && (
                <p className="text-amber-800 font-semibold bg-amber-50 p-2 rounded-xl border border-amber-200">
                  ⚠️ Ce ticket était à crédit. Le montant sera déduit automatiquement du solde du client.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700">
              Motif de l'annulation
            </label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="ex: Client a changé d'avis, erreur de saisie..."
              className="bg-white text-xs"
            />
          </div>

          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel disabled={cancelSaleMutation.isPending}>
              Fermer
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (saleToCancel) {
                  cancelSaleMutation.mutate({
                    saleId: saleToCancel.id,
                    reason: cancelReason,
                  });
                }
              }}
              disabled={cancelSaleMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 cursor-pointer"
            >
              {cancelSaleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sales List */}
      <div className="space-y-3">
        {sales.map((sale) => {
          const isExpanded = expandedSaleId === sale.id;
          const isCancelled = sale.status === 'cancelled';

          const saleProfit =
            sale.items.reduce((acc, item) => {
              return acc + (item.unit_sell_price - item.unit_buy_price) * item.quantity;
            }, 0) - sale.discount_amount;

          return (
            <div
              key={sale.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isCancelled
                  ? 'border-rose-200 bg-rose-50/20 opacity-85'
                  : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              {/* Row Header */}
              <button
                type="button"
                onClick={() => toggleExpand(sale.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isCancelled
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-sm ${
                          isCancelled ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        Ticket #{sale.receipt_number}
                      </span>

                      <Badge variant="outline" className="text-[11px] gap-1 font-medium bg-slate-50">
                        {getPaymentIcon(sale.payment_method)}
                        {getPaymentLabel(sale.payment_method)}
                      </Badge>

                      {isCancelled && (
                        <Badge variant="destructive" className="bg-rose-600 text-white font-black text-[10px]">
                          ANNULÉ
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(sale.created_at)}
                      </span>
                      <span>•</span>
                      <span>{sale.items.length} article(s)</span>
                      {sale.customer && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-indigo-600">
                            {sale.customer.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={`font-black text-base ${
                        isCancelled ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {sale.total_amount.toFixed(2)} DH
                    </div>
                    {!isCancelled && (
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        +{saleProfit.toFixed(2)} DH marge
                      </div>
                    )}
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  {/* Cancellation Alert Notice */}
                  {isCancelled && (
                    <div className="rounded-xl bg-rose-100/70 p-3 text-xs text-rose-900 border border-rose-200">
                      <div className="font-bold flex items-center gap-1.5">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Vente annulée le {formatTime(sale.cancelled_at || sale.created_at)}
                      </div>
                      <div className="text-[11px] text-rose-800 mt-0.5">
                        Motif : {sale.cancellation_reason || 'Retour article'} (Articles réintégrés au stock).
                      </div>
                    </div>
                  )}

                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Articles sur ce ticket
                  </div>

                  <div className="space-y-1.5">
                    {sale.items.map((item) => {
                      const itemMargin =
                        (item.unit_sell_price - item.unit_buy_price) * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Package className="h-4 w-4 text-slate-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-slate-900">
                                {item.product_name}
                              </span>
                              <span className="text-slate-400 ml-2">
                                (x{item.quantity} à {item.unit_sell_price.toFixed(2)} DH)
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-bold text-slate-900">
                              {item.total_price.toFixed(2)} DH
                            </div>
                            {!isCancelled && (
                              <div className="text-[10px] text-emerald-600">
                                +{itemMargin.toFixed(2)} DH
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subtotal & Discount */}
                  <div className="border-t border-slate-200/70 pt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{sale.subtotal.toFixed(2)} DH</span>
                    </div>
                    {sale.discount_amount > 0 && (
                      <div className="flex justify-between text-rose-600 font-medium">
                        <span>Remise accordée:</span>
                        <span>-{sale.discount_amount.toFixed(2)} DH</span>
                      </div>
                    )}
                    {sale.notes && (
                      <div className="pt-1 text-[11px] text-slate-400 italic">
                        Note: {sale.notes}
                      </div>
                    )}
                  </div>

                  {/* ACTION BAR: Reprint, WhatsApp & Cancel */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                    {/* Reprint / WhatsApp Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReceiptModal(sale)}
                        className="text-xs font-bold border-slate-300 hover:bg-slate-100 text-slate-800 gap-1.5 cursor-pointer"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Imprimer le Bon
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleOpenReceiptModal(sale)}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        WhatsApp
                      </Button>
                    </div>

                    {/* Cancellation Button */}
                    {!isCancelled && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleOpenCancel(e, sale)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5 font-bold cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Annuler ce ticket
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}