'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  TbPlus,
  TbMinus,
  TbPackages,
  TbCheck,
  TbChevronDown,
} from 'react-icons/tb';

interface QuickStockAdjusterProps {
  product: Product;
  onAdjustStock: (params: { id: string; delta?: number; setExact?: number }) => void;
}

export function QuickStockAdjuster({
  product,
  onAdjustStock,
}: QuickStockAdjusterProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [customAdd, setCustomAdd] = useState('');
  const [exactSet, setExactSet] = useState('');

  if (product.is_service) {
    return <span className="text-[11px] font-semibold text-neutral-400 italic">{t('common.service')}</span>;
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
    <div className="inline-flex items-center gap-1 bg-neutral-50/80 p-0.5 rounded-full border border-neutral-200/80">
      <button
        type="button"
        className="h-6 w-6 rounded-full flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
        onClick={() => onAdjustStock({ id: product.id, delta: -1 })}
        disabled={product.stock_quantity <= 0}
      >
        <TbMinus className="h-3 w-3 stroke-[2.5]" />
      </button>

      <span className="w-7 text-center text-xs font-black text-neutral-900">
        {product.stock_quantity}
      </span>

      <button
        type="button"
        className="h-6 w-6 rounded-full flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-95 cursor-pointer transition-all shadow-2xs"
        onClick={() => onAdjustStock({ id: product.id, delta: 1 })}
      >
        <TbPlus className="h-3 w-3 stroke-[2.5]" />
      </button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          className="inline-flex items-center justify-center h-6 px-2 gap-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold transition-all cursor-pointer shadow-2xs mx-0.5"
          title={t('stock.adjustRestock')}
        >
          <TbPackages className="h-3.5 w-3.5 stroke-[2.2]" />
          <TbChevronDown className="h-2.5 w-2.5 opacity-60" />
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-4 shadow-xl rounded-3xl bg-white border border-neutral-200">
          <div className="space-y-3.5">
            <div>
              <h4 className="font-extrabold text-xs text-neutral-900 leading-tight">
                {t('stock.quickRestock')}
              </h4>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                {product.name} ({t('stock.currentStockLabel')} {product.stock_quantity})
              </p>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                {t('stock.addPack')}
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {presets.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleApplyPreset(amount)}
                    className="flex h-8 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50/70 text-xs font-black text-neutral-700 transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:scale-95 cursor-pointer"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCustomAdd} className="pt-2 border-t border-neutral-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                {t('stock.customQty')}
              </span>
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  min="1"
                  placeholder="ex: 25"
                  value={customAdd}
                  onChange={(e) => setCustomAdd(e.target.value)}
                  className="h-8 text-xs bg-neutral-50 rounded-xl"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  {t('stock.addBtn')}
                </Button>
              </div>
            </form>

            <form onSubmit={handleExactSet} className="pt-2 border-t border-neutral-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                {t('stock.setExactStock')}
              </span>
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  min="0"
                  placeholder="ex: 12"
                  value={exactSet}
                  onChange={(e) => setExactSet(e.target.value)}
                  className="h-8 text-xs bg-neutral-50 rounded-xl"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs text-neutral-700 border-neutral-200 hover:bg-neutral-100 font-bold rounded-xl cursor-pointer"
                >
                  <TbCheck className="h-3 w-3 mr-1 stroke-[3]" /> {t('stock.setBtn')}
                </Button>
              </div>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}