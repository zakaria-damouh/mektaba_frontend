'use client';

import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
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
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ViewMode } from './product-filters';
import { QuickStockAdjuster } from './quick-stock-adjuster';
import { InlinePriceEditor } from './inline-price-editor';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  viewMode: ViewMode;
  onAdjustStock: (params: { id: string; delta?: number; setExact?: number }) => void;
  onUpdatePrice: (params: { id: string; field: 'sell_price' | 'buy_price'; value: number }) => Promise<void>;
  onViewDetails: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export function ProductList({
  products,
  isLoading,
  viewMode,
  onAdjustStock,
  onUpdatePrice,
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

              {/* Info & Adjuster */}
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
                  <div className="flex items-baseline justify-between mb-2">
                    <InlinePriceEditor
                      productId={product.id}
                      field="sell_price"
                      initialValue={product.sell_price}
                      onSave={onUpdatePrice}
                    />
                    <div className="text-[10px] text-slate-400">
                      Achat: {product.buy_price.toFixed(2)} DH
                    </div>
                  </div>

                  {/* Bulk Stock Adjuster */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Stock:
                    </span>
                    <QuickStockAdjuster
                      product={product}
                      onAdjustStock={onAdjustStock}
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400">
                    <button
                      type="button"
                      onClick={() => onViewDetails(product)}
                      className="hover:text-indigo-600 p-1 cursor-pointer"
                      title="Détails"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditProduct(product)}
                      className="hover:text-slate-800 p-1 cursor-pointer"
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product)}
                      className="hover:text-rose-600 p-1 cursor-pointer"
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
        {products.map((product) => (
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
              <div className="mt-1">
                <InlinePriceEditor
                  productId={product.id}
                  field="sell_price"
                  initialValue={product.sell_price}
                  onSave={onUpdatePrice}
                />
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <QuickStockAdjuster
                product={product}
                onAdjustStock={onAdjustStock}
              />
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="hover:text-slate-800 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(product)}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
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
              <TableHead className="text-right">Ajustement & Réassort</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
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

                  {/* INLINE EDITABLE SELLING PRICE */}
                  <TableCell>
                    <InlinePriceEditor
                      productId={product.id}
                      field="sell_price"
                      initialValue={product.sell_price}
                      onSave={onUpdatePrice}
                    />
                  </TableCell>

                  {/* INLINE EDITABLE BUY PRICE */}
                  <TableCell>
                    <InlinePriceEditor
                      productId={product.id}
                      field="buy_price"
                      initialValue={product.buy_price}
                      onSave={onUpdatePrice}
                    />
                  </TableCell>

                  {/* Dynamic Margin */}
                  <TableCell className="text-xs font-medium text-emerald-600">
                    +{margin.toFixed(2)} DH
                  </TableCell>

                  {/* Stock Status */}
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

                  {/* Bulk Restock Controls */}
                  <TableCell className="text-right">
                    <QuickStockAdjuster
                      product={product}
                      onAdjustStock={onAdjustStock}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => onViewDetails(product)}
                        className="p-1 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="Détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        className="p-1 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product)}
                        className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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