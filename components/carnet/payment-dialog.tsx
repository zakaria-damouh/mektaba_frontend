'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Customer } from '@/types';
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
  TbCoins,
  TbCheck,
  TbCash,
  TbCreditCard,
  TbBuildingBank,
  TbLoader2,
} from 'react-icons/tb';

interface PaymentDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({
  customer,
  open,
  onOpenChange,
}: PaymentDialogProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [notes, setNotes] = useState('');

  // All Hooks declared first
  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!customer) throw new Error('Client introuvable');

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Veuillez entrer un montant valide');
      }

      const { data, error } = await supabase.rpc('record_debt_payment', {
        p_customer_id: customer.id,
        p_amount: numAmount,
        p_payment_method: paymentMethod,
        p_notes: notes.trim() || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (customer) {
        queryClient.invalidateQueries({ queryKey: ['customer-history', customer.id] });
      }
      setAmount('');
      setNotes('');
      onOpenChange(false);
    },
    onError: (err: any) => {
      alert(`Erreur: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordPaymentMutation.mutate();
  };

  const handlePayFull = () => {
    if (customer) {
      setAmount(customer.current_debt.toString());
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200/90">
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
              <TbCoins className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base font-black tracking-tight text-neutral-900">
                Encaisser un Règlement
              </DialogTitle>
              <p className="text-[11px] text-neutral-400 font-medium">
                Client : <span className="font-extrabold text-neutral-800">{customer.name}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Current Debt Card */}
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Dette Actuelle sur le Carnet
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-950">
            {customer.current_debt.toFixed(2)}{' '}
            <span className="text-xs font-extrabold text-amber-700">DH</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Quick Pay Preset Pills */}
          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Règlement rapide
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={handlePayFull}
                className="flex-1 rounded-full px-3 py-1.5 text-xs font-extrabold border border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                Tout régler ({customer.current_debt.toFixed(0)} DH)
              </button>
              {[50, 100, 200].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="rounded-full px-3 py-1.5 text-xs font-bold border border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
                >
                  {preset} DH
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <Label htmlFor="pay_amount" className="text-xs font-bold text-neutral-700">
              Montant versé par le client (DH) *
            </Label>
            <Input
              id="pay_amount"
              type="number"
              step="0.50"
              min="0.50"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-black text-neutral-900 bg-white rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
            />
          </div>

          {/* Segmented Payment Method Pills */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-neutral-700">Mode de Règlement</Label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-full">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
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
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <TbCreditCard className="h-3.5 w-3.5" />
                <span>Carte</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <TbBuildingBank className="h-3.5 w-3.5" />
                <span>Virement</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="pay_notes" className="text-xs font-bold text-neutral-700">
              Remarque (Optionnel)
            </Label>
            <Input
              id="pay_notes"
              placeholder="ex: Avance rentrée, donné par son fils..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white text-xs rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-5 text-xs font-bold border-neutral-200 hover:bg-neutral-100"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={recordPaymentMutation.isPending}
              className="rounded-full px-6 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 gap-1.5 cursor-pointer"
            >
              {recordPaymentMutation.isPending ? (
                <TbLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TbCheck className="h-4 w-4 stroke-[3]" />
              )}
              Valider l'encaissement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}