'use client';

import { Product } from '@/types';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TbPackage,
  TbBarcode,
  TbTrendingUp,
  TbBox,
  TbCalendar,
  TbPencil,
  TbTrash,
  TbAlertTriangle,
  TbSparkles,
} from 'react-icons/tb';

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProductDetailsDialogProps) {
  if (!product) return null;

  const marginDH = product.sell_price - product.buy_price;
  const marginPercent =
    product.sell_price > 0 ? (marginDH / product.sell_price) * 100 : 0;
  const totalStockValue = product.buy_price * product.stock_quantity;
  const isLow =
    !product.is_service && product.stock_quantity <= product.min_stock_level;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-3xl shadow-2xl border border-neutral-200">
        {/* Photo Container */}
        <div className="h-48 w-full bg-neutral-50 flex items-center justify-center relative border-b border-neutral-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <TbPackage className="h-16 w-16 text-neutral-300 stroke-[1.5]" />
          )}

          {/* Floating Pill Badge */}
          <div className="absolute top-3.5 left-3.5">
            {product.is_service ? (
              <Badge variant="outline" className="rounded-full bg-white/90 backdrop-blur-md text-neutral-800 border-neutral-200 px-3 py-1 font-bold text-xs shadow-xs">
                <TbSparkles className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                Service
              </Badge>
            ) : isLow ? (
              <Badge variant="destructive" className="rounded-full bg-amber-500 gap-1 text-white px-3 py-1 font-bold text-xs shadow-xs">
                <TbAlertTriangle className="h-3.5 w-3.5 stroke-[2.5]" />
                Stock Faible ({product.stock_quantity})
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 font-bold text-xs shadow-xs">
                En Stock ({product.stock_quantity})
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <div className="text-[11px] text-emerald-700 font-extrabold uppercase tracking-wider">
              {product.category?.name || 'Sans Catégorie'}
            </div>
            <h2 className="text-xl font-black text-neutral-900 mt-0.5 tracking-tight">
              {product.name}
            </h2>
            {product.barcode && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono mt-1">
                <TbBarcode className="h-4 w-4" />
                {product.barcode}
              </div>
            )}
          </div>

          {/* 3-Column Airbnb Pricing Matrix */}
          <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-neutral-50/80 p-3.5 border border-neutral-100 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-neutral-400">Prix Vente</div>
              <div className="text-base font-black text-neutral-900 mt-0.5">
                {product.sell_price.toFixed(2)} <span className="text-[10px]">DH</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-neutral-400">Prix Achat</div>
              <div className="text-base font-semibold text-neutral-500 mt-0.5">
                {product.buy_price.toFixed(2)} <span className="text-[10px]">DH</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center justify-center gap-0.5">
                <TbTrendingUp className="h-3 w-3 stroke-[2.5]" /> Marge
              </div>
              <div className="text-base font-black text-emerald-600 mt-0.5">
                +{marginDH.toFixed(2)} <span className="text-[10px]">DH</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-bold">
                ({marginPercent.toFixed(0)}%)
              </div>
            </div>
          </div>

          {/* Business Insights */}
          {!product.is_service && (
            <div className="space-y-2 text-xs border-t border-neutral-100 pt-3 text-neutral-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
                  <TbBox className="h-4 w-4" />
                  Valeur totale en rayon (Achat):
                </span>
                <span className="font-extrabold text-neutral-900">
                  {totalStockValue.toFixed(2)} DH
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Seuil d'alerte minimum:</span>
                <span className="font-bold text-neutral-800">
                  {product.min_stock_level} unités
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 border-t border-neutral-100 pt-3">
            <TbCalendar className="h-4 w-4" />
            Ajouté le {formatDate(product.created_at)}
          </div>

          {/* Actions Bottom Bar */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onDelete(product);
              }}
              className="rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <TbTrash className="h-3.5 w-3.5 stroke-[2.2]" />
              Supprimer
            </Button>

            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(product);
              }}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <TbPencil className="h-3.5 w-3.5 stroke-[2.2]" />
              Modifier l'article
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}