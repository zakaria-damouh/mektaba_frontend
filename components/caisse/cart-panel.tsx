'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/use-cart-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Trash2,
  Plus,
  Minus,
  Banknote,
  CreditCard,
  Building,
  Loader2,
  ShoppingBag,
  Coins,
  PauseCircle,
  Play,
} from 'lucide-react';
import { ReceiptDialog, CompletedSaleData } from './receipt-dialog';
import { HeldCartsDialog } from './held-carts-dialog';

export function CartPanel() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Prevent Next.js SSR hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const {
    items,
    discount,
    paymentMethod,
    notes,
    heldCarts,
    updateQuantity,
    removeItem,
    setDiscount,
    setPaymentMethod,
    clearCart,
    getSubtotal,
    getTotal,
    holdCurrentCart,
  } = useCartStore();

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSaleData | null>(null);

  // Held Carts Modal State
  const [isHeldCartsOpen, setIsHeldCartsOpen] = useState(false);

  // Change Calculator State
  const [receivedAmount, setReceivedAmount] = useState<number | ''>('');

  const subtotal = getSubtotal();
  const total = getTotal();

  useEffect(() => {
    if (items.length === 0 || paymentMethod !== 'cash') {
      setReceivedAmount('');
    }
  }, [items.length, paymentMethod]);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (items.length === 0) throw new Error('Le panier est vide');

      const itemsSnapshot = items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.unit_price * item.quantity,
      }));

      const payloadItems = items.map((item) => ({
        product_id: item.is_custom ? null : item.product.id,
        custom_name: item.is_custom ? item.product.name : null,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { data: saleId, error } = await supabase.rpc('process_sale', {
        p_items: payloadItems,
        p_discount: discount,
        p_payment_method: paymentMethod,
        p_notes: notes.trim() || null,
      });

      if (error) throw error;

      const { data: saleRow } = await supabase
        .from('sales')
        .select('receipt_number')
        .eq('id', saleId)
        .single();

      return {
        saleId,
        receiptNumber: saleRow?.receipt_number || '1',
        itemsSnapshot,
        subtotalSnapshot: subtotal,
        discountSnapshot: discount,
        totalSnapshot: total,
        paymentMethodSnapshot: paymentMethod,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });

      setCompletedSale({
        receiptNumber: result.receiptNumber,
        items: result.itemsSnapshot,
        subtotal: result.subtotalSnapshot,
        discount: result.discountSnapshot,
        total: result.totalSnapshot,
        paymentMethod: result.paymentMethodSnapshot,
        date: new Date(),
      });

      setIsReceiptOpen(true);
      clearCart();
      setReceivedAmount('');
    },
    onError: (err: any) => {
      alert(err.message || 'Erreur lors de la vente');
    },
  });

  const numReceived = typeof receivedAmount === 'number' ? receivedAmount : 0;
  const changeDue = numReceived > 0 ? numReceived - total : 0;
  const isUnderpaid = numReceived > 0 && numReceived < total;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Receipt Dialog */}
      <ReceiptDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        saleData={completedSale}
        onNewSale={() => {
          setIsReceiptOpen(false);
          setCompletedSale(null);
        }}
      />

      {/* Held Carts Dialog */}
      <HeldCartsDialog
        open={isHeldCartsOpen}
        onOpenChange={setIsHeldCartsOpen}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-base">Panier Actuel</h2>
        </div>

        {/* Action buttons: Held carts badge & Hold current cart */}
        <div className="flex items-center gap-2">
          {/* Held Carts Indicator Button */}
          {heldCarts.length > 0 && (
            <button
              type="button"
              onClick={() => setIsHeldCartsOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer animate-pulse"
              title="Paniers en attente"
            >
              <PauseCircle className="h-3.5 w-3.5" />
              <span>{heldCarts.length} en attente</span>
            </button>
          )}

          {/* Put on Hold Button */}
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                holdCurrentCart();
                setReceivedAmount('');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              title="Mettre ce panier en attente pour servir un autre client"
            >
              <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
              <span>En attente</span>
            </button>
          )}

          {/* Clear Cart Button */}
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearCart();
                setReceivedAmount('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
            >
              Vider
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hasMounted ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-300">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="mt-2 text-xs text-slate-400">Chargement du panier...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <ShoppingBag className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs">Touchez un article à gauche pour l'ajouter</p>
            {heldCarts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsHeldCartsOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Reprendre un panier en attente ({heldCarts.length})
              </button>
            )}
          </div>
        ) : (
          items.map((item) => {
            const available = item.product.is_service
              ? 99999
              : useCartStore.getState().getAvailableStock(item.product);

            const isMaxStockReached =
              !item.product.is_service && item.quantity >= available;

            return (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-2.5 bg-slate-50/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-900 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {item.unit_price.toFixed(2)} DH / u
                    {isMaxStockReached && (
                      <span className="ml-2 text-[10px] font-bold text-amber-600">
                        (Max dispo atteint: {available})
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isMaxStockReached}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right pl-1">
                  <div className="font-bold text-xs text-slate-900">
                    {(item.unit_price * item.quantity).toFixed(2)} DH
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout */}
      {items.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-3">
          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition-colors border cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Banknote className="h-3.5 w-3.5" /> Espèces
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition-colors border cursor-pointer ${
                paymentMethod === 'card'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" /> Carte
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('transfer')}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition-colors border cursor-pointer ${
                paymentMethod === 'transfer'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building className="h-3.5 w-3.5" /> Virement
            </button>
          </div>

          {/* Cash Change Calculator */}
          {paymentMethod === 'cash' && (
            <div className="rounded-xl border border-indigo-100 bg-white p-2.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-indigo-600" />
                  Montant Reçu du client
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.50"
                  value={receivedAmount}
                  onChange={(e) =>
                    setReceivedAmount(
                      e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                    )
                  }
                  className="h-7 w-20 text-right text-xs font-bold text-slate-900 rounded-md border border-slate-200 px-1.5 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-5 gap-1">
                <button
                  type="button"
                  onClick={() => setReceivedAmount(total)}
                  className="h-7 rounded-md border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer"
                >
                  Exact
                </button>
                {[20, 50, 100, 200].map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setReceivedAmount(bill)}
                    className={`h-7 rounded-md border text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
                      receivedAmount === bill
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {bill}DH
                  </button>
                ))}
              </div>

              {numReceived > 0 && (
                <div
                  className={`flex items-center justify-between rounded-lg p-2 text-xs font-bold transition-all ${
                    isUnderpaid
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <span>
                    {isUnderpaid ? '⚠️ Reste à payer :' : '💸 Monnaie à rendre :'}
                  </span>
                  <span className="text-sm font-black">
                    {isUnderpaid
                      ? `${(total - numReceived).toFixed(2)} DH`
                      : `${changeDue.toFixed(2)} DH`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Discount Input */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <Label htmlFor="discount" className="text-xs text-slate-600 whitespace-nowrap">
              Remise / Tkhfid (DH)
            </Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.50"
              placeholder="0.00"
              value={discount || ''}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="h-8 w-24 text-right text-xs bg-white"
            />
          </div>

          {/* Total */}
          <div className="space-y-1 border-t border-slate-200 pt-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Sous-total:</span>
              <span>{subtotal.toFixed(2)} DH</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-rose-600 font-medium">
                <span>Remise appliquée:</span>
                <span>-{discount.toFixed(2)} DH</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-slate-900 text-sm">TOTAL À PAYER:</span>
              <span className="font-black text-indigo-700 text-xl">
                {total.toFixed(2)} DH
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending || items.length === 0}
            className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow text-white cursor-pointer"
          >
            {checkoutMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              `Valider la Vente (${total.toFixed(2)} DH)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}