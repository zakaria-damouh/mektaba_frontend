'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TbChevronDown,
  TbChevronUp,
  TbReceipt,
  TbCash,
  TbCreditCard,
  TbBuildingBank,
  TbNotebook,
  TbClock,
  TbPackage,
  TbRotate,
  TbAlertTriangle,
  TbLoader2,
  TbPrinter,
  TbBrandWhatsapp,
} from 'react-icons/tb';
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
  const { t } = useTranslation();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [saleForReceipt, setSaleForReceipt] = useState<CompletedSaleData | null>(null);

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
        return <TbCreditCard className="h-3.5 w-3.5 stroke-[2.2]" />;
      case 'transfer':
        return <TbBuildingBank className="h-3.5 w-3.5 stroke-[2.2]" />;
      case 'credit':
        return <TbNotebook className="h-3.5 w-3.5 stroke-[2.2]" />;
      default:
        return <TbCash className="h-3.5 w-3.5 stroke-[2.2]" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'card':
        return t('caisse.card');
      case 'transfer':
        return t('caisse.transfer');
      case 'credit':
        return t('caisse.credit');
      default:
        return t('caisse.cash');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-neutral-200/90 bg-white">
        <TbLoader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-neutral-200/90 bg-white">
        <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
          <TbReceipt className="h-6 w-6 stroke-[1.8]" />
        </div>
        <h3 className="text-sm font-bold text-neutral-900">{t('history.noSalesRecorded')}</h3>
        <p className="mt-1 text-xs text-neutral-400">
          {t('history.noSalesSub')}
        </p>
      </div>
    );
  }

  return (
    <>
      <ReceiptDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        saleData={saleForReceipt}
      />

      {/* Cancellation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <TbAlertTriangle className="h-5 w-5 stroke-[2.2]" />
              </div>
              <AlertDialogTitle className="text-base font-black text-neutral-900">
                {t('history.cancelModalTitle')} #{saleToCancel?.receipt_number} ؟
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-neutral-600 pt-2 space-y-2 leading-relaxed">
              <p>
                {t('history.cancelModalDesc')}{' '}
                <strong className="text-neutral-900">{saleToCancel?.total_amount.toFixed(2)} {t('common.dh')}</strong>.
              </p>
              {saleToCancel?.payment_method === 'credit' && (
                <p className="text-amber-800 font-bold bg-amber-50 p-2.5 rounded-2xl border border-amber-200/80">
                  {t('history.cancelCreditWarning')}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-neutral-700">
              {t('history.cancellationReason')}
            </label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="bg-white text-xs rounded-xl border-neutral-200 focus-visible:ring-rose-500/10 focus-visible:border-rose-500"
            />
          </div>

          <AlertDialogFooter className="pt-3">
            <AlertDialogCancel
              disabled={cancelSaleMutation.isPending}
              className="rounded-full px-5 text-xs font-bold border-neutral-200 hover:bg-neutral-100"
            >
              {t('common.close')}
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
              className="rounded-full px-6 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 cursor-pointer shadow-sm shadow-rose-600/20"
            >
              {cancelSaleMutation.isPending ? (
                <TbLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TbRotate className="h-4 w-4 stroke-[2.2]" />
              )}
              {t('history.confirmCancel')}
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
              className={`rounded-3xl border transition-all overflow-hidden ${
                isCancelled
                  ? 'border-rose-200 bg-rose-50/20 opacity-85'
                  : 'border-neutral-200/90 bg-white shadow-xs hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              {/* Row Header */}
              <button
                type="button"
                onClick={() => toggleExpand(sale.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-start transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      isCancelled
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <TbReceipt className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-black text-sm tracking-tight ${
                          isCancelled ? 'line-through text-neutral-400' : 'text-neutral-900'
                        }`}
                      >
                        #{sale.receipt_number}
                      </span>

                      <Badge variant="outline" className="rounded-full text-[11px] gap-1 font-bold bg-neutral-50 border-neutral-200/80 px-2.5 py-0.5">
                        {getPaymentIcon(sale.payment_method)}
                        {getPaymentLabel(sale.payment_method)}
                      </Badge>

                      {isCancelled && (
                        <Badge variant="destructive" className="rounded-full bg-rose-600 text-white font-black text-[10px] px-2.5 py-0.5">
                          {t('history.cancelledCount')}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400 font-medium">
                      <span className="flex items-center gap-1">
                        <TbClock className="h-3 w-3 stroke-[2]" />
                        {formatTime(sale.created_at)}
                      </span>
                      <span>•</span>
                      <span>{sale.items.length} {t('stock.article')}</span>
                      {sale.customer && (
                        <>
                          <span>•</span>
                          <span className="font-extrabold text-emerald-700">
                            {sale.customer.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-end">
                    <div
                      className={`font-black text-base ${
                        isCancelled ? 'line-through text-neutral-400' : 'text-neutral-900'
                      }`}
                    >
                      {sale.total_amount.toFixed(2)}{' '}
                      <span className="text-xs font-bold text-emerald-600">{t('common.dh')}</span>
                    </div>
                    {!isCancelled && (
                      <div className="text-[11px] text-emerald-700 font-bold">
                        +{saleProfit.toFixed(2)} {t('common.dh')} {t('stock.margin')}
                      </div>
                    )}
                  </div>

                  {isExpanded ? (
                    <TbChevronUp className="h-4 w-4 text-neutral-400 stroke-[2.5]" />
                  ) : (
                    <TbChevronDown className="h-4 w-4 text-neutral-400 stroke-[2.5]" />
                  )}
                </div>
              </button>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="border-t border-neutral-100 bg-neutral-50/50 p-4 sm:p-5 space-y-3">
                  {isCancelled && (
                    <div className="rounded-2xl bg-rose-100/70 p-3.5 text-xs text-rose-900 border border-rose-200 space-y-0.5">
                      <div className="font-black flex items-center gap-1.5">
                        <TbRotate className="h-3.5 w-3.5 stroke-[2.5]" />
                        {t('history.ticketCancelledOn')} {formatTime(sale.cancelled_at || sale.created_at)}
                      </div>
                      <div className="text-[11px] text-rose-800 font-medium">
                        {t('history.reasonLabel')} {sale.cancellation_reason || 'Retour article'}.
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    {t('history.articlesOnTicket')}
                  </div>

                  <div className="space-y-1.5">
                    {sale.items.map((item) => {
                      const itemMargin =
                        (item.unit_sell_price - item.unit_buy_price) * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-neutral-100 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <TbPackage className="h-4 w-4 text-neutral-400 shrink-0 stroke-[2]" />
                            <div className="truncate">
                              <span className="font-bold text-neutral-900">
                                {item.product_name}
                              </span>
                              <span className="text-neutral-400 font-medium ms-2">
                                (x{item.quantity} à {item.unit_sell_price.toFixed(2)} {t('common.dh')})
                              </span>
                            </div>
                          </div>

                          <div className="text-end shrink-0">
                            <div className="font-black text-neutral-900">
                              {item.total_price.toFixed(2)} {t('common.dh')}
                            </div>
                            {!isCancelled && (
                              <div className="text-[10px] font-bold text-emerald-700">
                                +{itemMargin.toFixed(2)} {t('common.dh')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subtotal & Discount */}
                  <div className="border-t border-neutral-200/70 pt-2 space-y-1 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span className="text-neutral-400 font-medium">{t('caisse.subtotal')}</span>
                      <span className="font-bold text-neutral-800">{sale.subtotal.toFixed(2)} {t('common.dh')}</span>
                    </div>
                    {sale.discount_amount > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>{t('caisse.appliedDiscount')}</span>
                        <span>-{sale.discount_amount.toFixed(2)} {t('common.dh')}</span>
                      </div>
                    )}
                    {sale.notes && (
                      <div className="pt-1 text-[11px] text-neutral-400 italic">
                        Note : {sale.notes}
                      </div>
                    )}
                  </div>

                  {/* ACTION BAR */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-200">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenReceiptModal(sale)}
                        className="h-8 rounded-full px-4 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <TbPrinter className="h-3.5 w-3.5 stroke-[2.2]" />
                        {t('history.reprintReceipt')}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleOpenReceiptModal(sale)}
                        className="h-8 rounded-full px-4 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                      >
                        <TbBrandWhatsapp className="h-4 w-4 stroke-[2.2]" />
                        {t('history.whatsApp')}
                      </Button>
                    </div>

                    {!isCancelled && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleOpenCancel(e, sale)}
                        className="h-8 rounded-full px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5 font-bold cursor-pointer"
                      >
                        <TbRotate className="h-3.5 w-3.5 stroke-[2.2]" />
                        {t('history.cancelTicket')}
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