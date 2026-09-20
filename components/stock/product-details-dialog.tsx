'use client';

import { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Barcode,
  TrendingUp,
  Boxes,
  Calendar,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

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
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Photo Header */}
        <div className="h-44 w-full bg-slate-100 flex items-center justify-center relative border-b border-slate-200">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <Package className="h-16 w-16 text-slate-300" />
          )}

          <div className="absolute top-3 left-3">
            {product.is_service ? (
              <Badge variant="secondary">Service</Badge>
            ) : isLow ? (
              <Badge variant="destructive" className="bg-amber-500 gap-1 text-white">
                <AlertTriangle className="h-3 w-3" />
                Stock Faible ({product.stock_quantity})
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                En Stock ({product.stock_quantity})
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
              {product.category?.name || 'Sans Catégorie'}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {product.name}
            </h2>
            {product.barcode && (
              <div className="flex items-center gap-1 text-xs text-slate-400 font-mono mt-1">
                <Barcode className="h-3.5 w-3.5" />
                {product.barcode}
              </div>
            )}
          </div>

          {/* Pricing & Margins Grid */}
          <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Prix Vente</div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {product.sell_price.toFixed(2)} <span className="text-[10px]">DH</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Prix Achat</div>
              <div className="text-base font-semibold text-slate-600 mt-0.5">
                {product.buy_price.toFixed(2)} <span className="text-[10px]">DH</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> Marge
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
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Boxes className="h-3.5 w-3.5 text-slate-400" />
                  Valeur totale en rayon (Achat):
                </span>
                <span className="font-bold text-slate-900">
                  {totalStockValue.toFixed(2)} DH
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Seuil d'alerte minimum:</span>
                <span className="font-semibold text-slate-800">
                  {product.min_stock_level} unités
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            <Calendar className="h-3.5 w-3.5" />
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
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </Button>

            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(product);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifier l'article
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}