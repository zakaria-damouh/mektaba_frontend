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
  TbAlertTriangle,
  TbPackage,
  TbEye,
  TbPencil,
  TbTrash,
  TbLoader2,
  TbSparkles,
} from 'react-icons/tb';
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
      <div className="flex h-64 items-center justify-center rounded-3xl border border-neutral-200/90 bg-white">
        <TbLoader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-neutral-200/90 bg-white">
        <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
          <TbPackage className="h-7 w-7 stroke-[1.8]" />
        </div>
        <h3 className="text-sm font-bold text-neutral-900">Aucun produit trouvé</h3>
        <p className="mt-1 text-xs text-neutral-400">
          Ajustez votre recherche ou ajoutez un nouvel article.
        </p>
      </div>
    );
  }

  // ==========================================
  // 1. SQUARES / GRID VIEW (Airbnb Listing Cards)
  // ==========================================
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {products.map((product) => {
          const isLow =
            !product.is_service &&
            product.stock_quantity <= product.min_stock_level;
          const isOut = !product.is_service && product.stock_quantity <= 0;

          return (
            <div
              key={product.id}
              className="group flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Photo Area (Airbnb Aspect Square) */}
              <div
                onClick={() => onViewDetails(product)}
                className="relative aspect-square w-full bg-neutral-50 flex items-center justify-center border-b border-neutral-100 overflow-hidden cursor-pointer"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-contain p-3 group-hover:scale-108 transition-transform duration-300 ease-out"
                  />
                ) : (
                  <TbPackage className="h-12 w-12 text-neutral-300 stroke-[1.5]" />
                )}

                {/* Floating Airbnb-Style Pill Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  {product.is_service ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-neutral-800 border border-neutral-200/60 shadow-xs">
                      <TbSparkles className="h-3 w-3 text-emerald-600" />
                      Service
                    </span>
                  ) : isOut ? (
                    <span className="rounded-full bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-xs">
                      Épuisé
                    </span>
                  ) : isLow ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 shadow-xs">
                      <TbAlertTriangle className="h-3 w-3 stroke-[2.5]" />
                      Faible
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div
                    onClick={() => onViewDetails(product)}
                    className="font-bold text-neutral-900 text-xs line-clamp-2 leading-snug cursor-pointer hover:text-emerald-700 transition-colors"
                  >
                    {product.name}
                  </div>
                  <div className="text-[10px] font-semibold text-neutral-400 mt-1 truncate">
                    {product.category?.name || 'Général'}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <InlinePriceEditor
                      productId={product.id}
                      field="sell_price"
                      initialValue={product.sell_price}
                      onSave={onUpdatePrice}
                    />
                    <div className="text-[10px] text-neutral-400 font-medium">
                      Achat: {product.buy_price.toFixed(2)} DH
                    </div>
                  </div>

                  {/* Stock Controller */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-500">
                      Stock:
                    </span>
                    <QuickStockAdjuster
                      product={product}
                      onAdjustStock={onAdjustStock}
                    />
                  </div>

                  {/* Action Icons Pill Bar */}
                  <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-neutral-400">
                    <button
                      type="button"
                      onClick={() => onViewDetails(product)}
                      className="p-1 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                      title="Détails"
                    >
                      <TbEye className="h-4 w-4 stroke-[2.2]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditProduct(product)}
                      className="p-1 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                      title="Modifier"
                    >
                      <TbPencil className="h-4 w-4 stroke-[2.2]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product)}
                      className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <TbTrash className="h-4 w-4 stroke-[2.2]" />
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
  // 2. TABLE VIEW (Airbnb Minimalist Table)
  // ==========================================
  return (
    <>
      {/* Mobile Card Row */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3 shadow-xs"
          >
            <div
              onClick={() => onViewDetails(product)}
              className="h-16 w-16 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden cursor-pointer"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <TbPackage className="h-7 w-7 text-neutral-300 stroke-[1.8]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div
                onClick={() => onViewDetails(product)}
                className="font-bold text-neutral-900 text-xs truncate cursor-pointer hover:text-emerald-700"
              >
                {product.name}
              </div>
              <div className="text-[10px] font-semibold text-neutral-400">
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
              <div className="flex items-center gap-2 text-neutral-400">
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="hover:text-neutral-900 cursor-pointer"
                >
                  <TbPencil className="h-3.5 w-3.5 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(product)}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <TbTrash className="h-3.5 w-3.5 stroke-[2.2]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Minimalist Table */}
      <div className="hidden md:block rounded-3xl border border-neutral-200/90 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50/80">
            <TableRow className="border-neutral-200/80">
              <TableHead className="w-16 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Photo
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Article
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Catégorie
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Prix Vente
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Prix Achat
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Marge
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Stock Actuel
              </TableHead>
              <TableHead className="text-right text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Ajustement & Réassort
              </TableHead>
              <TableHead className="text-right w-24 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isLow =
                !product.is_service &&
                product.stock_quantity <= product.min_stock_level;
              const margin = product.sell_price - product.buy_price;

              return (
                <TableRow
                  key={product.id}
                  className="border-neutral-100 hover:bg-neutral-50/70 transition-colors"
                >
                  {/* Photo */}
                  <TableCell>
                    <div
                      onClick={() => onViewDetails(product)}
                      className="h-11 w-11 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <TbPackage className="h-5 w-5 text-neutral-300 stroke-[1.8]" />
                      )}
                    </div>
                  </TableCell>

                  {/* Name & Barcode */}
                  <TableCell>
                    <div
                      onClick={() => onViewDetails(product)}
                      className="font-bold text-neutral-900 cursor-pointer hover:text-emerald-700 transition-colors"
                    >
                      {product.name}
                    </div>
                    {product.barcode && (
                      <div className="text-[11px] font-mono text-neutral-400">
                        {product.barcode}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-neutral-600 text-xs font-medium">
                    {product.category?.name || '—'}
                  </TableCell>

                  {/* Inline Selling Price */}
                  <TableCell>
                    <InlinePriceEditor
                      productId={product.id}
                      field="sell_price"
                      initialValue={product.sell_price}
                      onSave={onUpdatePrice}
                    />
                  </TableCell>

                  {/* Inline Buy Price */}
                  <TableCell>
                    <InlinePriceEditor
                      productId={product.id}
                      field="buy_price"
                      initialValue={product.buy_price}
                      onSave={onUpdatePrice}
                    />
                  </TableCell>

                  {/* Margin */}
                  <TableCell className="text-xs font-black text-emerald-600">
                    +{margin.toFixed(2)} DH
                  </TableCell>

                  {/* Stock Status Badge */}
                  <TableCell>
                    {product.is_service ? (
                      <Badge variant="outline" className="rounded-full bg-neutral-50 text-neutral-700 border-neutral-200 font-bold text-[10px]">
                        Service
                      </Badge>
                    ) : isLow ? (
                      <Badge variant="destructive" className="rounded-full bg-amber-500 gap-1 font-bold text-[10px] text-white">
                        <TbAlertTriangle className="h-3 w-3 stroke-[2.5]" />
                        Faible ({product.stock_quantity})
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200/80 font-bold text-[10px]"
                      >
                        {product.stock_quantity} unités
                      </Badge>
                    )}
                  </TableCell>

                  {/* Quick Adjuster */}
                  <TableCell className="text-right">
                    <QuickStockAdjuster
                      product={product}
                      onAdjustStock={onAdjustStock}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-neutral-400">
                      <button
                        type="button"
                        onClick={() => onViewDetails(product)}
                        className="p-1.5 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                        title="Détails"
                      >
                        <TbEye className="h-4 w-4 stroke-[2.2]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <TbPencil className="h-4 w-4 stroke-[2.2]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <TbTrash className="h-4 w-4 stroke-[2.2]" />
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