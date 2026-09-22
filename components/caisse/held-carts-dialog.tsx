'use client';

import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/use-cart-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  TbPlayerPause,
  TbPlayerPlay,
  TbTrash,
  TbClock,
  TbShoppingBag,
} from 'react-icons/tb';

interface HeldCartsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HeldCartsDialog({ open, onOpenChange }: HeldCartsDialogProps) {
  const { t } = useTranslation();
  const heldCarts = useCartStore((state) => state.heldCarts);
  const resumeHeldCart = useCartStore((state) => state.resumeHeldCart);
  const deleteHeldCart = useCartStore((state) => state.deleteHeldCart);

  const formatTime = (date: Date | string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleResume = (id: string) => {
    resumeHeldCart(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200/90">
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs">
              <TbPlayerPause className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base font-black tracking-tight text-neutral-900">
                {t('caisse.heldCartsTitle')} ({heldCarts.length})
              </DialogTitle>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                {t('caisse.heldCartsSubtitle')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto pr-1">
          {heldCarts.length === 0 ? (
            <div className="py-14 text-center text-neutral-400">
              <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-300 mx-auto mb-2">
                <TbShoppingBag className="h-6 w-6 stroke-[1.8]" />
              </div>
              <p className="text-xs font-medium">{t('caisse.noHeldCarts')}</p>
            </div>
          ) : (
            heldCarts.map((cart, index) => (
              <div
                key={cart.id}
                className="rounded-2xl border border-neutral-200/90 bg-neutral-50/60 p-4 space-y-3 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-neutral-900">
                      {t('caisse.order')} #{index + 1}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                      <TbClock className="h-3.5 w-3.5 stroke-[2]" />
                      {formatTime(cart.createdAt)}
                    </span>
                  </div>
                  <span className="font-black text-neutral-900 text-base">
                    {cart.total.toFixed(2)}{' '}
                    <span className="text-xs text-emerald-600 font-bold">{t('common.dh')}</span>
                  </span>
                </div>

                <div className="text-xs text-neutral-600 bg-white rounded-xl p-2.5 border border-neutral-100 space-y-1">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-baseline truncate">
                      <span className="truncate font-medium">
                        • {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-black text-neutral-900 ml-2 shrink-0">
                        {(item.unit_price * item.quantity).toFixed(2)} {t('common.dh')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteHeldCart(cart.id)}
                    className="h-8 rounded-full px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5 font-bold cursor-pointer"
                  >
                    <TbTrash className="h-3.5 w-3.5 stroke-[2.2]" />
                    {t('common.delete')}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleResume(cart.id)}
                    className="h-8 rounded-full px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                  >
                    <TbPlayerPlay className="h-3.5 w-3.5 fill-current" />
                    {t('caisse.resumeOrderBtn')}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}