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
import { Coins, CheckCircle2, Banknote, CreditCard, Building, Loader2 } from 'lucide-react';

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

  // ALL HOOKS MUST BE DECLARED FIRST (Before any conditional returns)
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

  // Safe early return ONLY AFTER all hooks have executed
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600">
            <Coins className="h-6 w-6" />
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Encaisser un Règlement
              </DialogTitle>
              <p className="text-xs text-slate-400">
                Client : <span className="font-bold text-slate-700">{customer.name}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Current Debt Card */}
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 text-center space-y-1">
          <span className="text-xs font-semibold text-amber-800">Dette Actuelle</span>
          <div className="text-2xl font-black text-amber-900">
            {customer.current_debt.toFixed(2)} <span className="text-xs">DH</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Quick Pay Buttons */}
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePayFull}
              className="flex-1 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
            >
              Régler la totalité ({customer.current_debt.toFixed(0)} DH)
            </Button>
            {[50, 100, 200].map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(preset.toString())}
                className="text-xs  font-bold border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                {preset} DH
              </Button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <Label htmlFor="pay_amount" className="text-xs">
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
              className="text-lg font-black text-slate-900 bg-white"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label className="text-xs">Mode de Règlement</Label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold border cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <Banknote className="h-3.5 w-3.5" /> Espèces
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold border cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" /> Carte
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold border cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <Building className="h-3.5 w-3.5" /> Virement
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="pay_notes" className="text-xs">
              Remarque (Optionnel)
            </Label>
            <Input
              id="pay_notes"
              placeholder="ex: Avance rentrée, donné par son fils..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white text-xs"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={recordPaymentMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 cursor-pointer"
            >
              {recordPaymentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Valider l'encaissement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}