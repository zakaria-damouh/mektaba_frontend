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
import {
  AlertTriangle,
  Package,
  Loader2,
  Plus,
  Minus,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ViewMode } from './product-filters';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  viewMode: ViewMode;
  onAdjustStock: (id: string, delta: number) => void;
  onViewDetails: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export function ProductList({
  products,
  isLoading,
  viewMode,
  onAdjustStock,
  onViewDetails,
  onEditProduct,
  onDeleteProduct,
}: ProductListProps) {
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

  // ==========================================
  // 1. SQUARES / GRID VIEW
  // ==========================================
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product) => {
          const isLow =
            !product.is_service &&
            product.stock_quantity <= product.min_stock_level;
          const isOut = !product.is_service && product.stock_quantity <= 0;

          return (
            <div
              key={product.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-sm transition-all"
            >
              {/* Image Area */}
              <div
                onClick={() => onViewDetails(product)}
                className="relative aspect-square w-full bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden cursor-pointer"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Package className="h-10 w-10 text-slate-300 stroke-[1.5]" />
                )}

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.is_service ? (
                    <span className="rounded-md bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5">
                      Service
                    </span>
                  ) : isOut ? (
                    <span className="rounded-md bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5">
                      Épuisé
                    </span>
                  ) : isLow ? (
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Faible
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div
                    onClick={() => onViewDetails(product)}
                    className="font-semibold text-slate-900 text-xs line-clamp-2 leading-snug cursor-pointer hover:text-indigo-600"
                  >
                    {product.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {product.category?.name || 'Général'}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-black text-slate-900">
                      {product.sell_price.toFixed(2)} DH
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Achat: {product.buy_price.toFixed(2)} DH
                    </span>
                  </div>

                  {/* Stock counter & Quick Adjust */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">
                      {product.is_service ? 'Illimité' : `Stock: ${product.stock_quantity}`}
                    </span>

                    {!product.is_service && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onAdjustStock(product.id, -1)}
                          disabled={product.stock_quantity <= 0}
                          className="h-6 w-6 flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdjustStock(product.id, 1)}
                          className="h-6 w-6 flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit/Details action icons */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400">
                    <button
                      type="button"
                      onClick={() => onViewDetails(product)}
                      className="hover:text-indigo-600 p-1"
                      title="Voir Détails"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditProduct(product)}
                      className="hover:text-slate-800 p-1"
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product)}
                      className="hover:text-rose-600 p-1"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ==========================================
  // 2. TABLE VIEW
  // ==========================================
  return (
    <>
      {/* Mobile view for table mode */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {products.map((product) => {
          const isLow =
            !product.is_service &&
            product.stock_quantity <= product.min_stock_level;

          return (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
            >
              <div
                onClick={() => onViewDetails(product)}
                className="h-16 w-16 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Package className="h-6 w-6 text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  onClick={() => onViewDetails(product)}
                  className="font-semibold text-slate-900 text-xs truncate cursor-pointer hover:text-indigo-600"
                >
                  {product.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {product.category?.name || 'Général'}
                </div>
                <div className="font-bold text-slate-900 text-sm mt-1">
                  {product.sell_price.toFixed(2)} DH
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {!product.is_service && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onAdjustStock(product.id, -1)}
                      disabled={product.stock_quantity <= 0}
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-30"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-800">
                      {product.stock_quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdjustStock(product.id, 1)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-400">
                  <button
                    type="button"
                    onClick={() => onEditProduct(product)}
                    className="hover:text-slate-800"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(product)}
                    className="hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix Vente</TableHead>
              <TableHead>Prix Achat</TableHead>
              <TableHead>Marge</TableHead>
              <TableHead>Stock Actuel</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  {/* Photo */}
                  <TableCell>
                    <div
                      onClick={() => onViewDetails(product)}
                      className="h-11 w-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                  </TableCell>

                  {/* Name & Barcode */}
                  <TableCell>
                    <div
                      onClick={() => onViewDetails(product)}
                      className="font-medium text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      {product.name}
                    </div>
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

                  {/* Stock Quick +/- AND Action Icons */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      {!product.is_service && (
                        <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => onAdjustStock(product.id, -1)}
                            disabled={product.stock_quantity <= 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-xs font-bold text-slate-800">
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
                      )}

                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => onViewDetails(product)}
                          className="p-1 hover:text-indigo-600 transition-colors"
                          title="Détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditProduct(product)}
                          className="p-1 hover:text-slate-800 transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(product)}
                          className="p-1 hover:text-rose-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
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