'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { TbBolt, TbPlus } from 'react-icons/tb';

interface CustomItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomItemDialog({ open, onOpenChange }: CustomItemDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = (i18n.language || 'fr').startsWith('ar');
  const addCustomItem = useCartStore((state) => state.addCustomItem);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  // Moroccan Maktaba presets
  const presets = [
    { labelFr: 'Photocopie N&B', labelAr: 'تصوير عادي N&B', price: 1.0 },
    { labelFr: 'Photocopie Couleur', labelAr: 'تصوير ملون Couleur', price: 2.5 },
    { labelFr: 'Feuille Canson', labelAr: 'ورق رسم كانسون Canson', price: 1.5 },
    { labelFr: 'Reliure Spirale', labelAr: 'تغليف سلك Reliure', price: 5.0 },
    { labelFr: 'Plastification', labelAr: 'تغليف بلاستيك', price: 4.0 },
    { labelFr: 'Papier Cadeau', labelAr: 'ورق هدايا Cadeau', price: 3.0 },
  ];

  const handleApplyPreset = (presetLabel: string, presetPrice: number) => {
    setName(presetLabel);
    setPrice(presetPrice.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    const numQty = parseInt(quantity) || 1;

    if (!isNaN(numPrice) && numPrice > 0) {
      addCustomItem(name.trim() || (isArabic ? 'سلعة أخرى' : 'Article Divers'), numPrice, numQty);
      setName('');
      setPrice('');
      setQuantity('1');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200/90">
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-xs">
              <TbBolt className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base font-black tracking-tight text-neutral-900">
                {t('caisse.customItemTitle')}
              </DialogTitle>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                {t('caisse.customItemSub')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Presets Grid */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              {t('caisse.frequentServices')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const label = isArabic ? p.labelAr : p.labelFr;
                const isSelected = name === label && price === p.price.toString();

                return (
                  <button
                    key={p.labelFr}
                    type="button"
                    onClick={() => handleApplyPreset(label, p.price)}
                    className={`flex items-center justify-between rounded-2xl border p-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer text-start ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-2 ring-emerald-600/10'
                        : 'border-neutral-200/90 bg-neutral-50/60 text-neutral-700 hover:border-emerald-400 hover:bg-white hover:shadow-xs'
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    <span className="font-black text-neutral-900 mx-1 shrink-0">
                      {p.price.toFixed(2)} {t('common.dh')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Name */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-100">
            <Label htmlFor="custom_name" className="text-xs font-bold text-neutral-700">
              {t('caisse.itemDesignation')}
            </Label>
            <Input
              id="custom_name"
              placeholder="ex: Impression, Canson..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white rounded-xl border-neutral-200 text-xs focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
            />
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="custom_price" className="text-xs font-bold text-neutral-700">
                {t('caisse.unitPrice')}
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
                className="bg-white rounded-xl border-neutral-200 text-xs font-black text-neutral-900 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom_qty" className="text-xs font-bold text-neutral-700">
                {t('caisse.quantity')}
              </Label>
              <Input
                id="custom_qty"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-white rounded-xl border-neutral-200 text-xs font-bold text-neutral-800 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-5 text-xs font-bold border-neutral-200 hover:bg-neutral-100"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="rounded-full px-6 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 gap-1.5 cursor-pointer"
            >
              <TbPlus className="h-4 w-4 stroke-[2.5]" />
              {t('caisse.addToCart')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 