'use client';

import { useState } from 'react';
import { Product, Category } from '@/types';
import { useCartStore } from '@/store/use-cart-store';
import { Button } from '@/components/ui/button';
import {
  TbSearch,
  TbPackage,
  TbBolt,
  TbClock,
  TbSparkles,
  TbX,
} from 'react-icons/tb';
import { CustomItemDialog } from './custom-item-dialog';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
}

export function ProductGrid({ products, categories, isLoading }: ProductGridProps) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const getHeldQuantity = useCartStore((state) => state.getHeldQuantity);
  const getAvailableStock = useCartStore((state) => state.getAvailableStock);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchesCat = selectedCat === 'all' || p.category_id === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Vente Libre Modal */}
      <CustomItemDialog
        open={isCustomDialogOpen}
        onOpenChange={setIsCustomDialogOpen}
      />

      {/* ======================================================== */}
      {/* SEARCH CAPSULE & VENTE LIBRE BUTTON                      */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Airbnb Capsule Search Input */}
          <div className="flex-1 flex items-center rounded-full border border-neutral-200/90 bg-white p-1 pl-4 shadow-xs hover:shadow-sm transition-all focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10">
            <TbSearch className="h-4 w-4 shrink-0 text-neutral-400 stroke-[2.2]" />
            <input
              type="text"
              placeholder="Rechercher un article ou scanner code-barres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-2 text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer mr-1"
              >
                <TbX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Vente Libre Pill Button */}
          <Button
            type="button"
            onClick={() => setIsCustomDialogOpen(true)}
            className="h-10 gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs hover:shadow-md transition-all hover:scale-102 shrink-0 px-4 cursor-pointer"
          >
            <TbBolt className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Vente Libre</span>
          </Button>
        </div>

        {/* ======================================================== */}
        {/* AIRBNB HORIZONTAL CATEGORY PILL CHIPS                    */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            Tous
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCat(c.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedCat === c.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white text-neutral-600 border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* AIRBNB-STYLE PRODUCT CARDS GRID                          */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-xs font-semibold text-neutral-400">
              Chargement des articles...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-neutral-200/90 bg-white">
            <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
              <TbPackage className="h-6 w-6 stroke-[1.8]" />
            </div>
            <p className="text-xs font-bold text-neutral-700">Aucun article trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
            {filtered.map((product) => {
              const inCartQty =
                cartItems.find((item) => item.product.id === product.id)?.quantity || 0;

              const heldQty = getHeldQuantity(product.id);
              const availableStock = getAvailableStock(product);
              const remainingSellable = Math.max(0, availableStock - inCartQty);

              const isOut = !product.is_service && product.stock_quantity <= 0;
              const isAllHeld = !product.is_service && heldQty >= product.stock_quantity;
              const isMaxInCart = !product.is_service && remainingSellable <= 0;

              const isDisabled = isOut || isMaxInCart;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => !isDisabled && addItem(product)}
                  disabled={isDisabled}
                  className={`group flex flex-col justify-between text-left rounded-3xl border bg-white overflow-hidden shadow-xs transition-all duration-300 ${
                    isDisabled
                      ? 'opacity-45 cursor-not-allowed border-neutral-200 bg-neutral-50/70'
                      : 'border-neutral-200/90 hover:border-emerald-500 hover:shadow-lg active:scale-[0.98] cursor-pointer hover:-translate-y-1'
                  }`}
                >
                  {/* Photo Area (Aspect Square) */}
                  <div className="relative aspect-square w-full bg-neutral-50 flex items-center justify-center overflow-hidden border-b border-neutral-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain p-3 group-hover:scale-108 transition-transform duration-300 ease-out"
                      />
                    ) : (
                      <TbPackage className="h-10 w-10 text-neutral-300 stroke-[1.5]" />
                    )}

                    {/* Floating Pill Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {product.is_service ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-neutral-800 border border-neutral-200/60 shadow-xs">
                          <TbSparkles className="h-3 w-3 text-emerald-600" />
                          Service
                        </span>
                      ) : isOut ? (
                        <span className="rounded-full bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-xs">
                          Épuisé
                        </span>
                      ) : isAllHeld ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 shadow-xs">
                          <TbClock className="h-3 w-3 stroke-[2.5]" />
                          Réservé ({heldQty})
                        </span>
                      ) : inCartQty > 0 ? (
                        <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-xs shadow-emerald-600/30">
                          x{inCartQty} en panier
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 text-xs line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-[10px] font-semibold text-neutral-400 mt-1 truncate">
                        {product.category?.name || 'Général'}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-100">
                      <span className="text-sm font-black text-neutral-900">
                        {product.sell_price.toFixed(2)} <span className="text-[10px] font-bold text-emerald-600">DH</span>
                      </span>

                      {!product.is_service && (
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-extrabold ${
                              remainingSellable <= product.min_stock_level
                                ? 'text-amber-600'
                                : 'text-neutral-400'
                            }`}
                          >
                            Dispo: {remainingSellable}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}