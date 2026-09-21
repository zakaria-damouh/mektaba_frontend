'use client';

import { useCartStore, HeldCart } from '@/store/use-cart-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PauseCircle, Play, Trash2, Clock, ShoppingBag } from 'lucide-react';

interface HeldCartsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HeldCartsDialog({ open, onOpenChange }: HeldCartsDialogProps) {
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
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <PauseCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Paniers en Attente ({heldCarts.length})
              </DialogTitle>
              <p className="text-xs text-slate-400">
                Reprenez la commande d'un client en cours
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto">
          {heldCarts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingBag className="h-10 w-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="mt-2 text-xs">Aucun panier en attente pour le moment</p>
            </div>
          ) : (
            heldCarts.map((cart, index) => (
              <div
                key={cart.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Panier #{index + 1}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {formatTime(cart.createdAt)}
                    </span>
                  </div>
                  <span className="font-black text-indigo-700 text-base">
                    {cart.total.toFixed(2)} DH
                  </span>
                </div>

                {/* Items preview */}
                <div className="text-xs text-slate-600 bg-white rounded-xl p-2 border border-slate-100 space-y-1">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between truncate">
                      <span className="truncate">
                        • {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-semibold text-slate-800 ml-2">
                        {(item.unit_price * item.quantity).toFixed(2)} DH
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteHeldCart(cart.id)}
                    className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleResume(cart.id)}
                    className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Reprendre la commande
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