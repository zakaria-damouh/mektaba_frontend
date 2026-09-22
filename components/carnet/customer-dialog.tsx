'use client';

import { useState, useEffect } from 'react';
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
  TbUser,
  TbPhone,
  TbFileText,
  TbLoader2,
  TbCoins,
} from 'react-icons/tb';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerToEdit?: Customer | null;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customerToEdit,
}: CustomerDialogProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(customerToEdit);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [initialDebt, setInitialDebt] = useState('0');

  useEffect(() => {
    if (open) {
      if (customerToEdit) {
        setName(customerToEdit.name);
        setPhone(customerToEdit.phone || '');
        setNotes(customerToEdit.notes || '');
        setInitialDebt(customerToEdit.current_debt.toString());
      } else {
        setName('');
        setPhone('');
        setNotes('');
        setInitialDebt('0');
      }
    }
  }, [open, customerToEdit]);

  const saveCustomerMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        current_debt: parseFloat(initialDebt) || 0,
      };

      if (isEditMode && customerToEdit) {
        const { error } = await supabase
          .from('customers')
          .update(payload)
          .eq('id', customerToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('customers').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      alert(`Erreur: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveCustomerMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200/90">
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
              <TbUser className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base font-black tracking-tight text-neutral-900">
                {isEditMode ? 'Modifier la Fiche Client' : 'Nouveau Client au Carnet'}
              </DialogTitle>
              <p className="text-[11px] text-neutral-400 font-medium">
                Gestion des crédits et coordonnées WhatsApp
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cust_name" className="text-xs font-bold text-neutral-700">
              Nom complet ou Surnom *
            </Label>
            <div className="relative">
              <TbUser className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 stroke-[2.2]" />
              <Input
                id="cust_name"
                required
                placeholder="ex: Si Mohamed (Prof Maths), Famille Bennani"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-white rounded-xl border-neutral-200 text-xs focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="cust_phone" className="text-xs font-bold text-neutral-700">
              Numéro de Téléphone (Pour rappels WhatsApp)
            </Label>
            <div className="relative">
              <TbPhone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 stroke-[2.2]" />
              <Input
                id="cust_phone"
                placeholder="ex: 06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 bg-white rounded-xl border-neutral-200 text-xs focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="cust_notes" className="text-xs font-bold text-neutral-700">
              Remarque / Adresse
            </Label>
            <div className="relative">
              <TbFileText className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 stroke-[2.2]" />
              <Input
                id="cust_notes"
                placeholder="ex: Voisin d'en face, Règle à la fin du mois..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="pl-10 bg-white rounded-xl border-neutral-200 text-xs focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
              />
            </div>
          </div>

          {/* Paper Notebook Transfer Box (Only on create) */}
          {!isEditMode && (
            <div className="space-y-1.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3.5">
              <Label htmlFor="cust_debt" className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <TbCoins className="h-4 w-4 text-amber-700 stroke-[2.2]" />
                Ancienne dette à reporter (Optionnel)
              </Label>
              <p className="text-[11px] text-amber-800/80 leading-snug">
                Si ce client a déjà une dette sur votre ancien carnet papier, inscrivez-la ici.
              </p>
              <Input
                id="cust_debt"
                type="number"
                step="0.50"
                min="0"
                value={initialDebt}
                onChange={(e) => setInitialDebt(e.target.value)}
                className="bg-white font-black text-neutral-900 rounded-xl border-amber-200 text-sm mt-1 focus-visible:ring-amber-500/10 focus-visible:border-amber-500"
              />
            </div>
          )}

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
              disabled={saveCustomerMutation.isPending}
              className="rounded-full px-6 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              {saveCustomerMutation.isPending && (
                <TbLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Enregistrer' : 'Créer la fiche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}