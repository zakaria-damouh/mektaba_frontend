'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Minus, PackagePlus, Check, ChevronDown } from 'lucide-react';

interface QuickStockAdjusterProps {
  product: Product;
  onAdjustStock: (params: { id: string; delta?: number; setExact?: number }) => void;
}

export function QuickStockAdjuster({
  product,
  onAdjustStock,
}: QuickStockAdjusterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customAdd, setCustomAdd] = useState('');
  const [exactSet, setExactSet] = useState('');

  if (product.is_service) {
    return <span className="text-xs text-slate-400 italic">Service</span>;
  }

  const presets = [5, 10, 20, 50, 100];

  const handleApplyPreset = (amount: number) => {
    onAdjustStock({ id: product.id, delta: amount });
    setIsOpen(false);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(customAdd);
    if (!isNaN(qty) && qty > 0) {
      onAdjustStock({ id: product.id, delta: qty });
      setCustomAdd('');
      setIsOpen(false);
    }
  };

  const handleExactSet = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(exactSet);
    if (!isNaN(qty) && qty >= 0) {
      onAdjustStock({ id: product.id, setExact: qty });
      setExactSet('');
      setIsOpen(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      {/* Quick -1 Button */}
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
        onClick={() => onAdjustStock({ id: product.id, delta: -1 })}
        disabled={product.stock_quantity <= 0}
        title="Retirer 1 unité"
      >
        <Minus className="h-3 w-3" />
      </Button>

      {/* Stock Quantity */}
      <span className="w-8 text-center text-xs font-bold text-slate-900">
        {product.stock_quantity}
      </span>

      {/* Quick +1 Button */}
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"
        onClick={() => onAdjustStock({ id: product.id, delta: 1 })}
        title="Ajouter 1 unité"
      >
        <Plus className="h-3 w-3" />
      </Button>

      {/* Bulk Pack Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          className="inline-flex items-center justify-center h-7 px-1.5 gap-0.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 text-xs font-medium transition-colors cursor-pointer"
          title="Réassort par carton / lot"
        >
          <PackagePlus className="h-3.5 w-3.5" />
          <ChevronDown className="h-2.5 w-2.5 opacity-60" />
        </PopoverTrigger>

        <PopoverContent align="end" className="w-64 p-3 shadow-lg rounded-2xl bg-white">
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900 leading-tight">
                Réassort rapide
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {product.name} (Actuel: {product.stock_quantity})
              </p>
            </div>

            {/* Presets */}
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Ajouter un carton / paquet
              </span>
              <div className="grid grid-cols-5 gap-1">
                {presets.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleApplyPreset(amount)}
                    className="flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Addition */}
            <form onSubmit={handleCustomAdd} className="pt-2 border-t border-slate-100">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Ajouter une quantité spécifique
              </span>
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  min="1"
                  placeholder="ex: 15, 36"
                  value={customAdd}
                  onChange={(e) => setCustomAdd(e.target.value)}
                  className="h-8 text-xs bg-slate-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Ajouter
                </Button>
              </div>
            </form>

            {/* Exact Setting */}
            <form onSubmit={handleExactSet} className="pt-2 border-t border-slate-100">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Régler le stock exact en rayon
              </span>
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  min="0"
                  placeholder="ex: 8"
                  value={exactSet}
                  onChange={(e) => setExactSet(e.target.value)}
                  className="h-8 text-xs bg-slate-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-100"
                >
                  <Check className="h-3 w-3 mr-1" /> Fixer
                </Button>
              </div>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}