'use client';

import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
        <h3 className="text-sm font-bold text-neutral-900">{t('stock.noProductsFound')}</h3>
        <p className="mt-1 text-xs text-neutral-400">
          {t('stock.noProductsSub')}
        </p>
      </div>
    );
  }

  // SQUARES / GRID VIEW
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
              {/* Photo Area */}
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

                <div className="absolute top-2.5 start-2.5 flex flex-col gap-1">
                  {product.is_service ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-neutral-800 border border-neutral-200/60 shadow-xs">
                      <TbSparkles className="h-3 w-3 text-emerald-600" />
                      {t('common.service')}
                    </span>
                  ) : isOut ? (
                    <span className="rounded-full bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-xs">
                      {t('caisse.outOfStockBadge')}
                    </span>
                  ) : isLow ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 shadow-xs">
                      <TbAlertTriangle className="h-3 w-3 stroke-[2.5]" />
                      {t('stock.lowStock')}
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
                    {product.category?.name || t('stock.uncategorized')}
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
                      {t('stock.buyPrice')} : {product.buy_price.toFixed(2)} {t('common.dh')}
                    </div>
                  </div>

                  {/* Stock Controller */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-500">
                      {t('stock.currentStock')} :
                    </span>
                    <QuickStockAdjuster
                      product={product}
                      onAdjustStock={onAdjustStock}
                    />
                  </div>

                  {/* Action Icons Bar */}
                  <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-neutral-400">
                    <button
                      type="button"
                      onClick={() => onViewDetails(product)}
                      className="p-1 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                      title={t('common.details')}
                    >
                      <TbEye className="h-4 w-4 stroke-[2.2]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditProduct(product)}
                      className="p-1 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                      title={t('common.edit')}
                    >
                      <TbPencil className="h-4 w-4 stroke-[2.2]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product)}
                      className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title={t('common.delete')}
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

  // TABLE VIEW
  return (
    <>
      {/* Mobile Card Rows */}
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
                {product.category?.name || t('stock.uncategorized')}
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

      {/* Desktop Table */}
      <div className="hidden md:block rounded-3xl border border-neutral-200/90 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50/80">
            <TableRow className="border-neutral-200/80">
              <TableHead className="w-16 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {t('stock.photo')}
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {t('stock.article')}
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {t('stock.category')}
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {t('stock.sellPrice')}
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {t('stock.buyPrice')}
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {t('stock.margin')}
              </TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {t('stock.currentStock')}
              </TableHead>
              <TableHead className="text-end text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {t('stock.adjustRestock')}
              </TableHead>
              <TableHead className="text-end w-24 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {t('stock.actions')}
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

                  <TableCell>
                    <InlinePriceEditor
                      productId={product.id}
                      field="sell_price"
                      initialValue={product.sell_price}
                      onSave={onUpdatePrice}
                    />
                  </TableCell>

                  <TableCell>
                    <InlinePriceEditor
                      productId={product.id}
                      field="buy_price"
                      initialValue={product.buy_price}
                      onSave={onUpdatePrice}
                    />
                  </TableCell>

                  <TableCell className="text-xs font-black text-emerald-600">
                    +{margin.toFixed(2)} {t('common.dh')}
                  </TableCell>

                  <TableCell>
                    {product.is_service ? (
                      <Badge variant="outline" className="rounded-full bg-neutral-50 text-neutral-700 border-neutral-200 font-bold text-[10px]">
                        {t('common.service')}
                      </Badge>
                    ) : isLow ? (
                      <Badge variant="destructive" className="rounded-full bg-amber-500 gap-1 font-bold text-[10px] text-white">
                        <TbAlertTriangle className="h-3 w-3 stroke-[2.5]" />
                        {t('stock.lowStock')} ({product.stock_quantity})
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200/80 font-bold text-[10px]"
                      >
                        {product.stock_quantity} {t('common.units')}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-end">
                    <QuickStockAdjuster
                      product={product}
                      onAdjustStock={onAdjustStock}
                    />
                  </TableCell>

                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1 text-neutral-400">
                      <button
                        type="button"
                        onClick={() => onViewDetails(product)}
                        className="p-1.5 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                        title={t('common.details')}
                      >
                        <TbEye className="h-4 w-4 stroke-[2.2]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                        title={t('common.edit')}
                      >
                        <TbPencil className="h-4 w-4 stroke-[2.2]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                        title={t('common.delete')}
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