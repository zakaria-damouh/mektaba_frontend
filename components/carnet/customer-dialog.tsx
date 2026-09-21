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
import { User, Phone, FileText, Loader2, Coins } from 'lucide-react';

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
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <User className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              {isEditMode ? 'Modifier la fiche client' : 'Nouveau Client au Carnet'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cust_name" className="text-xs">
              Nom complet ou Surnom *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="cust_name"
                required
                placeholder="ex: Si Mohamed (Prof Maths), Famille Bennani"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="cust_phone" className="text-xs">
              Numéro de Téléphone (Pour rappels WhatsApp)
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="cust_phone"
                placeholder="ex: 06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="cust_notes" className="text-xs">
              Remarque / Adresse
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="cust_notes"
                placeholder="ex: Voisin d'en face, Règle à la fin du mois..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          {/* Transfer old paper notebook balance */}
          {!isEditMode && (
            <div className="space-y-1.5 rounded-2xl bg-amber-50/60 border border-amber-200 p-3">
              <Label htmlFor="cust_debt" className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-amber-600" />
                Ancienne dette à reporter (Optionnel)
              </Label>
              <p className="text-[11px] text-amber-700/80">
                Si ce client a déjà une dette sur votre ancien carnet papier, inscrivez-la ici.
              </p>
              <Input
                id="cust_debt"
                type="number"
                step="0.50"
                min="0"
                value={initialDebt}
                onChange={(e) => setInitialDebt(e.target.value)}
                className="bg-white font-bold text-slate-900 mt-1"
              />
            </div>
          )}

          {/* Actions */}
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
              disabled={saveCustomerMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
            >
              {saveCustomerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Enregistrer' : 'Créer la fiche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}