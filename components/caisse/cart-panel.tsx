'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/use-cart-store';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TbTrash,
  TbPlus,
  TbMinus,
  TbCash,
  TbCreditCard,
  TbBuildingBank,
  TbLoader2,
  TbShoppingBag,
  TbCoins,
  TbPlayerPause,
  TbPlayerPlay,
  TbNotebook,
} from 'react-icons/tb';
import { ReceiptDialog, CompletedSaleData } from './receipt-dialog';
import { HeldCartsDialog } from './held-carts-dialog';

export function CartPanel() {
  const supabase = createClient();
  const queryClient = useQueryClient();

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
    getAvailableStock,
  } = useCartStore();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Customer selection for Credit Sales
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Customer[];
    },
  });

  // Modal States
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSaleData | null>(null);
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

      if (paymentMethod === 'credit' && !selectedCustomerId) {
        throw new Error('Veuillez sélectionner un client pour une vente à crédit');
      }

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
        p_customer_id: paymentMethod === 'credit' ? selectedCustomerId : null,
      });

      if (error) throw error;

      const { data: saleRow } = await supabase
        .from('sales')
        .select('receipt_number')
        .eq('id', saleId)
        .single();

      const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

      return {
        saleId,
        receiptNumber: saleRow?.receipt_number || '1',
        itemsSnapshot,
        subtotalSnapshot: subtotal,
        discountSnapshot: discount,
        totalSnapshot: total,
        paymentMethodSnapshot: paymentMethod,
        customerName: selectedCustomer ? selectedCustomer.name : null,
        customerPhone: selectedCustomer ? selectedCustomer.phone : null,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });

      setCompletedSale({
        receiptNumber: result.receiptNumber,
        items: result.itemsSnapshot,
        subtotal: result.subtotalSnapshot,
        discount: result.discountSnapshot,
        total: result.totalSnapshot,
        paymentMethod: result.paymentMethodSnapshot,
        customerName: result.customerName,
        customerPhone: result.customerPhone,
        date: new Date(),
      });

      setIsReceiptOpen(true);
      clearCart();
      setReceivedAmount('');
      setSelectedCustomerId('');
    },
    onError: (err: any) => {
      alert(err.message || 'Erreur lors de la vente');
    },
  });

  const numReceived = typeof receivedAmount === 'number' ? receivedAmount : 0;
  const changeDue = numReceived > 0 ? numReceived - total : 0;
  const isUnderpaid = numReceived > 0 && numReceived < total;

  return (
    <div className="flex flex-col h-full rounded-3xl border border-neutral-200/90 bg-white shadow-xs overflow-hidden">
      {/* Receipt Modal */}
      <ReceiptDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        saleData={completedSale}
        onNewSale={() => {
          setIsReceiptOpen(false);
          setCompletedSale(null);
        }}
      />

      {/* Held Carts Modal */}
      <HeldCartsDialog
        open={isHeldCartsOpen}
        onOpenChange={setIsHeldCartsOpen}
      />

      {/* ======================================================== */}
      {/* CART HEADER                                              */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between border-b border-neutral-100 p-4 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <TbShoppingBag className="h-4 w-4 stroke-[2.2]" />
          </div>
          <h2 className="font-extrabold text-neutral-900 text-sm tracking-tight">
            Panier Actuel
          </h2>
        </div>

        {/* Action buttons: Held badge & Park button */}
        <div className="flex items-center gap-2">
          {heldCarts.length > 0 && (
            <button
              type="button"
              onClick={() => setIsHeldCartsOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <TbPlayerPause className="h-3 w-3 stroke-[2.5]" />
              <span>{heldCarts.length} en attente</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                holdCurrentCart();
                setReceivedAmount('');
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-amber-700 hover:bg-amber-50 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              title="Mettre en attente"
            >
              <TbPlayerPause className="h-3.5 w-3.5 text-amber-600 stroke-[2.2]" />
              <span className="hidden sm:inline">En attente</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearCart();
                setReceivedAmount('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Vider
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* CART ITEMS LIST                                          */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {!hasMounted ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-neutral-300">
            <TbLoader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <p className="mt-2 text-xs text-neutral-400">Chargement...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-neutral-400">
            <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-300 mb-2">
              <TbShoppingBag className="h-6 w-6 stroke-[1.8]" />
            </div>
            <p className="text-xs font-medium">Touchez un article à gauche pour l'ajouter</p>
            {heldCarts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsHeldCartsOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
              >
                <TbPlayerPlay className="h-3.5 w-3.5 fill-current" />
                Reprendre un panier ({heldCarts.length})
              </button>
            )}
          </div>
        ) : (
          items.map((item) => {
            const available = item.product.is_service
              ? 99999
              : getAvailableStock(item.product);

            const isMaxReached =
              !item.product.is_service && item.quantity >= available;

            return (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-2.5 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-2.5 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-neutral-900 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-medium">
                    {item.unit_price.toFixed(2)} DH / u
                    {isMaxReached && (
                      <span className="ml-2 text-[10px] font-bold text-amber-600">
                        (Max: {available})
                      </span>
                    )}
                  </div>
                </div>

                {/* Airbnb Rounded-Full Quantity Controller */}
                <div className="flex items-center gap-1 bg-white rounded-full border border-neutral-200/80 p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95 cursor-pointer"
                  >
                    <TbMinus className="h-3 w-3 stroke-[2.5]" />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-neutral-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isMaxReached}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <TbPlus className="h-3 w-3 stroke-[2.5]" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right pl-1">
                  <div className="font-black text-xs text-neutral-900">
                    {(item.unit_price * item.quantity).toFixed(2)} DH
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="text-neutral-300 hover:text-rose-600 transition-colors cursor-pointer mt-0.5"
                  >
                    <TbTrash className="h-3.5 w-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* CHECKOUT & FINANCIAL FOOTER                              */}
      {/* ======================================================== */}
      {items.length > 0 && (
        <div className="border-t border-neutral-100 bg-neutral-50/40 p-4 space-y-3">
          {/* Segmented Payment Method Pills */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-full">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`flex items-center justify-center gap-1 rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TbCash className="h-3.5 w-3.5" />
              <span>Espèces</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('credit')}
              className={`flex items-center justify-center gap-1 rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'credit'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TbNotebook className="h-3.5 w-3.5" />
              <span>Crédit</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center gap-1 rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TbCreditCard className="h-3.5 w-3.5" />
              <span>Carte</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('transfer')}
              className={`flex items-center justify-center gap-1 rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'transfer'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TbBuildingBank className="h-3.5 w-3.5" />
              <span>Virement</span>
            </button>
          </div>

          {/* Customer Dropdown for Credit Sales */}
          {paymentMethod === 'credit' && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 space-y-1.5 animate-in fade-in">
              <Label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <TbNotebook className="h-3.5 w-3.5 text-amber-700 stroke-[2.2]" />
                Sélectionner le Client au Carnet *
              </Label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full h-9 rounded-xl border border-amber-300 bg-white px-3 text-xs font-bold text-neutral-900 focus:outline-hidden"
              >
                <option value="">-- Choisir un client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.current_debt > 0 ? `(Dette: ${c.current_debt.toFixed(0)} DH)` : '(À jour)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cash Change Calculator */}
          {paymentMethod === 'cash' && (
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-3 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-700 flex items-center gap-1">
                  <TbCoins className="h-4 w-4 text-emerald-600 stroke-[2]" />
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
                  className="h-7 w-20 text-right text-xs font-black text-neutral-900 rounded-full border border-neutral-200 px-2 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Banknote Pills */}
              <div className="grid grid-cols-5 gap-1">
                <button
                  type="button"
                  onClick={() => setReceivedAmount(total)}
                  className="h-7 rounded-full border border-neutral-200 bg-neutral-50 text-[11px] font-bold text-neutral-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 transition-all cursor-pointer"
                >
                  Exact
                </button>
                {[20, 50, 100, 200].map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setReceivedAmount(bill)}
                    className={`h-7 rounded-full border text-[11px] font-black transition-all active:scale-95 cursor-pointer ${
                      receivedAmount === bill
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                    }`}
                  >
                    {bill}DH
                  </button>
                ))}
              </div>

              {/* Live Change Due Banner */}
              {numReceived > 0 && (
                <div
                  className={`flex items-center justify-between rounded-xl p-2 text-xs font-bold transition-all ${
                    isUnderpaid
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  <span>
                    {isUnderpaid ? ' Reste à payer :' : ' Monnaie à rendre :'}
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

          {/* Discount / Tkhfid */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <Label htmlFor="discount" className="text-xs font-semibold text-neutral-500 whitespace-nowrap">
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
              className="h-8 w-24 text-right text-xs bg-white rounded-xl border-neutral-200 font-bold"
            />
          </div>

          {/* Subtotal & Total */}
          <div className="space-y-1 border-t border-neutral-200 pt-2">
            <div className="flex justify-between text-xs text-neutral-400 font-medium">
              <span>Sous-total:</span>
              <span>{subtotal.toFixed(2)} DH</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-rose-600 font-bold">
                <span>Remise:</span>
                <span>-{discount.toFixed(2)} DH</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1">
              <span className="font-black text-neutral-900 text-sm">TOTAL À PAYER:</span>
              <span className="font-black text-neutral-900 text-xl">
                {total.toFixed(2)} <span className="text-xs text-emerald-600">DH</span>
              </span>
            </div>
          </div>

          {/* Main Checkout Button */}
          <Button
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending || items.length === 0}
            className="w-full h-12 text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md shadow-emerald-600/20 hover:scale-101 active:scale-[0.99] transition-all cursor-pointer"
          >
            {checkoutMutation.isPending ? (
              <TbLoader2 className="h-5 w-5 animate-spin" />
            ) : (
              `Valider la Vente (${total.toFixed(2)} DH)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}