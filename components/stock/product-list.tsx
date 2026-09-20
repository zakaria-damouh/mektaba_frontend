'use client';

import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Package, Loader2, Tag, Plus, Minus } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onAdjustStock: (id: string, delta: number) => void;
}

export function ProductList({ products, isLoading, onAdjustStock }: ProductListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-white">
        <Package className="h-12 w-12 text-slate-300" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">Aucun produit trouvé</h3>
        <p className="mt-1 text-xs text-slate-500">
          Ajustez votre recherche ou ajoutez un nouvel article.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 1. Mobile Cards View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {products.map((product) => {
          const isLow =
            !product.is_service &&
            product.stock_quantity <= product.min_stock_level;

          return (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 leading-snug">
                    {product.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {product.category?.name && (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {product.category.name}
                      </span>
                    )}
                    {product.barcode && (
                      <span className="font-mono text-slate-400">
                        • {product.barcode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 text-base">
                    {product.sell_price.toFixed(2)} DH
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Achat: {product.buy_price.toFixed(2)} DH
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  {product.is_service ? (
                    <Badge variant="secondary">Service</Badge>
                  ) : isLow ? (
                    <Badge variant="destructive" className="bg-amber-500 text-white gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Stock: {product.stock_quantity}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                      Stock: {product.stock_quantity}
                    </Badge>
                  )}
                </div>

                {!product.is_service && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onAdjustStock(product.id, -1)}
                      disabled={product.stock_quantity <= 0}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 active:bg-slate-200 disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {product.stock_quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdjustStock(product.id, 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 active:bg-slate-200"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Table View */}
      <div className="hidden md:block rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix Vente</TableHead>
              <TableHead>Prix Achat</TableHead>
              <TableHead>Marge Brute</TableHead>
              <TableHead>Stock Actuel</TableHead>
              <TableHead className="text-right">Ajustement Rapide</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isLow =
                !product.is_service &&
                product.stock_quantity <= product.min_stock_level;
              const margin = product.sell_price - product.buy_price;

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{product.name}</div>
                    {product.barcode && (
                      <div className="text-xs font-mono text-slate-400">
                        {product.barcode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {product.category?.name || '—'}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {product.sell_price.toFixed(2)} DH
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {product.buy_price.toFixed(2)} DH
                  </TableCell>
                  <TableCell className="text-xs font-medium text-emerald-600">
                    +{margin.toFixed(2)} DH
                  </TableCell>
                  <TableCell>
                    {product.is_service ? (
                      <Badge variant="secondary">Service</Badge>
                    ) : isLow ? (
                      <Badge variant="destructive" className="bg-amber-500 gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Faible ({product.stock_quantity})
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {product.stock_quantity} unités
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {!product.is_service ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => onAdjustStock(product.id, -1)}
                          disabled={product.stock_quantity <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {product.stock_quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => onAdjustStock(product.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}