'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { printElement } from '@/lib/print';
import { SaleWithItems } from './sales-list';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TbBuildingStore,
  TbCoins,
  TbPrinter,
  TbCheck,
  TbAlertTriangle,
  TbLoader2,
} from 'react-icons/tb';

interface CloseRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todaySales: SaleWithItems[];
}

export function CloseRegisterDialog({
  open,
  onOpenChange,
  todaySales,
}: CloseRegisterDialogProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [countedCash, setCountedCash] = useState('');
  const [notes, setNotes] = useState('');

  // Filter completed (non-cancelled) sales
  const completedSales = todaySales.filter((s) => s.status !== 'cancelled');

  const totalSalesCount = completedSales.length;
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total_amount, 0);

  const totalProfit = completedSales.reduce((acc, sale) => {
    const saleProfit =
      sale.items.reduce((itemAcc, item) => {
        return itemAcc + (item.unit_sell_price - item.unit_buy_price) * item.quantity;
      }, 0) - sale.discount_amount;
    return acc + saleProfit;
  }, 0);

  const expectedCash = completedSales
    .filter((s) => s.payment_method === 'cash')
    .reduce((acc, s) => acc + s.total_amount, 0);

  const cardTotal = completedSales
    .filter((s) => s.payment_method === 'card')
    .reduce((acc, s) => acc + s.total_amount, 0);

  const transferTotal = completedSales
    .filter((s) => s.payment_method === 'transfer')
    .reduce((acc, s) => acc + s.total_amount, 0);

  const creditTotal = completedSales
    .filter((s) => s.payment_method === 'credit')
    .reduce((acc, s) => acc + s.total_amount, 0);

  // Variance calculation
  const numCounted = parseFloat(countedCash) || 0;
  const cashDifference = countedCash === '' ? 0 : numCounted - expectedCash;

  const saveClosureMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        total_sales_count: totalSalesCount,
        total_revenue: totalRevenue,
        total_profit: totalProfit,
        expected_cash: expectedCash,
        counted_cash: numCounted,
        cash_difference: cashDifference,
        card_total: cardTotal,
        transfer_total: transferTotal,
        credit_total: creditTotal,
        notes: notes.trim() || null,
      };

      const { error } = await supabase.from('cash_closures').insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-closures'] });
      setTimeout(() => {
        printElement('printable-z-report');
      }, 100);
    },
    onError: (err: any) => {
      alert(`Erreur: ${err.message}`);
    },
  });

  const currentDateStr = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto border border-neutral-200/90">
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-xs">
              <TbBuildingStore className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base font-black tracking-tight text-neutral-900">
                Clôture de Caisse (Ticket Z)
              </DialogTitle>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                Rapprochement financier de fin de journée
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Expected Summary Box */}
        <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4 space-y-3">
          <div className="flex justify-between items-baseline border-b border-neutral-200/70 pb-2.5">
            <span className="text-xs font-bold text-neutral-500">Espèces Attendu (Caisse)</span>
            <span className="text-xl font-black text-neutral-900">
              {expectedCash.toFixed(2)}{' '}
              <span className="text-xs font-bold text-emerald-600">DH</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white rounded-xl p-2.5 border border-neutral-100 shadow-2xs">
              <div className="text-[10px] text-neutral-400 font-bold uppercase">Carte</div>
              <div className="font-extrabold text-neutral-900 mt-0.5">{cardTotal.toFixed(0)} DH</div>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-neutral-100 shadow-2xs">
              <div className="text-[10px] text-neutral-400 font-bold uppercase">Crédit</div>
              <div className="font-extrabold text-amber-700 mt-0.5">{creditTotal.toFixed(0)} DH</div>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-neutral-100 shadow-2xs">
              <div className="text-[10px] text-neutral-400 font-bold uppercase">Bénéfice</div>
              <div className="font-extrabold text-emerald-700 mt-0.5">+{totalProfit.toFixed(0)} DH</div>
            </div>
          </div>
        </div>

        {/* Physical Cash Count Input */}
        <div className="space-y-2 pt-1">
          <Label htmlFor="counted_cash" className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
            <TbCoins className="h-4 w-4 text-emerald-600 stroke-[2.2]" />
            Espèces comptées dans le tiroir-caisse (DH) *
          </Label>
          <Input
            id="counted_cash"
            type="number"
            step="0.50"
            placeholder="ex: 1450.00"
            value={countedCash}
            onChange={(e) => setCountedCash(e.target.value)}
            className="text-lg font-black text-neutral-900 bg-white rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
          />

          {/* Real-time Variance Pill */}
          {countedCash !== '' && (
            <div
              className={`flex items-center justify-between rounded-2xl p-3 text-xs font-bold transition-all ${
                cashDifference === 0
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : cashDifference > 0
                  ? 'bg-blue-50 text-blue-900 border border-blue-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              <span>
                {cashDifference === 0
                  ? '✓ Caisse Parfaite (Aucun écart)'
                  : cashDifference > 0
                  ? 'Excédent de caisse :'
                  : 'Manquant de caisse :'}
              </span>
              <span className="text-sm font-black">
                {cashDifference > 0 ? `+${cashDifference.toFixed(2)}` : cashDifference.toFixed(2)} DH
              </span>
            </div>
          )}
        </div>

        {/* Closure Note */}
        <div className="space-y-1.5">
          <Label htmlFor="closure_notes" className="text-xs font-bold text-neutral-700">
            Note de clôture (Optionnel)
          </Label>
          <Input
            id="closure_notes"
            placeholder="ex: Rendu monnaie livreur..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs bg-white rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
          />
        </div>

        {/* ======================================================== */}
        {/* PRINTABLE THERMAL Z-REPORT (Targeted by printElement)    */}
        {/* ======================================================== */}
        <div className="hidden">
          <div id="printable-z-report" className="font-mono text-xs text-neutral-900 space-y-3">
            <div className="text-center space-y-1 border-b-2 border-dashed border-black pb-2">
              <div className="font-black text-base">MAKTABA POS</div>
              <div className="font-bold text-xs">*** TICKET Z - CLÔTURE DU JOUR ***</div>
              <div className="text-[10px]">{currentDateStr}</div>
            </div>

            <div className="space-y-1 py-1 text-xs">
              <div className="flex justify-between">
                <span>Ventes validées :</span>
                <span className="font-bold">{totalSalesCount} tickets</span>
              </div>
              <div className="flex justify-between">
                <span>Chiffre d'Affaires :</span>
                <span className="font-bold">{totalRevenue.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-black font-bold">
                <span>Marge Bénéficiaire :</span>
                <span>+{totalProfit.toFixed(2)} DH</span>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-black pt-2 space-y-1 text-xs">
              <div className="font-bold text-[11px] underline">RÈGLEMENTS :</div>
              <div className="flex justify-between">
                <span>Espèces attendu :</span>
                <span>{expectedCash.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between font-black">
                <span>Espèces compté :</span>
                <span>{numCounted.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between font-black border-t border-dotted border-black pt-1">
                <span>ÉCART DE CAISSE :</span>
                <span>{cashDifference >= 0 ? `+${cashDifference.toFixed(2)}` : cashDifference.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Carte Bancaire :</span>
                <span>{cardTotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between">
                <span>Crédit (Carnet) :</span>
                <span>{creditTotal.toFixed(2)} DH</span>
              </div>
              {transferTotal > 0 && (
                <div className="flex justify-between">
                  <span>Virement :</span>
                  <span>{transferTotal.toFixed(2)} DH</span>
                </div>
              )}
            </div>

            {notes && (
              <div className="border-t border-dashed border-black pt-2 text-[10px] italic">
                Note : {notes}
              </div>
            )}

            <div className="border-t-2 border-dashed border-black pt-4 space-y-4">
              <div className="text-[10px]">Visa / Signature du Gérant :</div>
              <div className="border-b border-black h-8 w-full"></div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <Button
            type="button"
            disabled={saveClosureMutation.isPending || countedCash === ''}
            onClick={() => saveClosureMutation.mutate()}
            className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-full gap-2 shadow-xs hover:scale-101 active:scale-[0.99] transition-all cursor-pointer"
          >
            {saveClosureMutation.isPending ? (
              <TbLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TbPrinter className="h-4 w-4 stroke-[2.2]" />
            )}
            Enregistrer & Imprimer le Ticket Z
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-neutral-400 hover:text-neutral-900 text-xs font-bold rounded-full cursor-pointer"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}