'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  Receipt,
  Banknote,
  CreditCard,
  Building,
  Clock,
  Package,
} from 'lucide-react';

export interface SaleWithItems {
  id: string;
  receipt_number: number;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  notes: string | null;
  created_at: string;
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
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSaleId((prev) => (prev === id ? null : id));
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
    <div className="space-y-3">
      {sales.map((sale) => {
        const isExpanded = expandedSaleId === sale.id;

        // Calculate profit for this single sale
        const saleProfit = sale.items.reduce((acc, item) => {
          return acc + (item.unit_sell_price - item.unit_buy_price) * item.quantity;
        }, 0) - sale.discount_amount;

        return (
          <div
            key={sale.id}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all"
          >
            {/* Clickable Header Row */}
            <button
              type="button"
              onClick={() => toggleExpand(sale.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      Ticket #{sale.receipt_number}
                    </span>
                    <Badge variant="outline" className="text-[11px] gap-1 font-medium bg-slate-50">
                      {getPaymentIcon(sale.payment_method)}
                      {getPaymentLabel(sale.payment_method)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(sale.created_at)}
                    </span>
                    <span>•</span>
                    <span>{sale.items.length} article(s)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-black text-slate-900 text-base">
                    {sale.total_amount.toFixed(2)} DH
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold">
                    +{saleProfit.toFixed(2)} DH marge
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </button>

            {/* Expandable Receipt Details */}
            {isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Détails du Ticket
                </div>

                <div className="space-y-2">
                  {sale.items.map((item) => {
                    const itemMargin =
                      (item.unit_sell_price - item.unit_buy_price) * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-2xs text-xs"
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
                          <div className="text-[10px] text-emerald-600">
                            +{itemMargin.toFixed(2)} DH
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal & Discount summary */}
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}