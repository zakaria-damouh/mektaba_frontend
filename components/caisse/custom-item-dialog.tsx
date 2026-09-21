'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/use-cart-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Plus } from 'lucide-react';

interface CustomItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomItemDialog({ open, onOpenChange }: CustomItemDialogProps) {
  const addCustomItem = useCartStore((state) => state.addCustomItem);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  // Common quick Maktaba presets
  const presets = [
    { label: 'Photocopie N&B', price: 1.0 },
    { label: 'Photocopie Couleur', price: 2.5 },
    { label: 'Feuille Canson', price: 1.5 },
    { label: 'Reliure Spirale', price: 5.0 },
    { label: 'Plastification', price: 4.0 },
    { label: 'Papier Cadeau', price: 3.0 },
  ];

  const handleApplyPreset = (presetName: string, presetPrice: number) => {
    setName(presetName);
    setPrice(presetPrice.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    const numQty = parseInt(quantity) || 1;

    if (!isNaN(numPrice) && numPrice > 0) {
      addCustomItem(name.trim() || 'Article Divers', numPrice, numQty);
      setName('');
      setPrice('');
      setQuantity('1');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Zap className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Vente Libre / Article Rapide
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Presets Grid */}
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Services & Articles Fréquents
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p.label, p.price)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-xs font-medium text-slate-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900 transition-all cursor-pointer text-left"
                >
                  <span className="truncate">{p.label}</span>
                  <span className="font-bold text-slate-900 ml-1">
                    {p.price.toFixed(2)} DH
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Name */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <Label htmlFor="custom_name" className="text-xs">
              Désignation de l'article / Service
            </Label>
            <Input
              id="custom_name"
              placeholder="ex: Article Divers, Impression..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white"
            />
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="custom_price" className="text-xs">
                Prix unitaire (DH) *
              </Label>
              <Input
                id="custom_price"
                type="number"
                step="0.10"
                min="0.10"
                required
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-white font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom_qty" className="text-xs">
                Quantité
              </Label>
              <Input
                id="custom_qty"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

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
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Ajouter au Panier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}