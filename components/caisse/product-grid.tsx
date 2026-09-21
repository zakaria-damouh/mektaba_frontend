'use client';

import { useState } from 'react';
import { Product, Category } from '@/types';
import { useCartStore } from '@/store/use-cart-store';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Package, Zap, Clock } from 'lucide-react';
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
    <div className="flex flex-col h-full space-y-4">
      {/* Vente Libre Modal */}
      <CustomItemDialog
        open={isCustomDialogOpen}
        onOpenChange={setIsCustomDialogOpen}
      />

      {/* Search Bar + Vente Libre Button */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher un article ou scanner code-barres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>

          <Button
            type="button"
            onClick={() => setIsCustomDialogOpen(true)}
            className="h-10 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs shrink-0 cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Vente Libre</span>
          </Button>
        </div>

        {/* Category horizontal scroll bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tous
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCat(c.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedCat === c.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-slate-400">Chargement des articles...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">Aucun article trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filtered.map((product) => {
              const inCartQty =
                cartItems.find((item) => item.product.id === product.id)?.quantity || 0;
              
              // Units locked in held carts
              const heldQty = getHeldQuantity(product.id);
              
              // Remaining stock that can actually be sold
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
                  className={`group flex flex-col justify-between text-left rounded-2xl border bg-white overflow-hidden shadow-xs transition-all ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50/70'
                      : 'border-slate-200 hover:border-indigo-400 hover:shadow-sm active:scale-[0.98] cursor-pointer'
                  }`}
                >
                  {/* Photo Thumbnail & Badges */}
                  <div className="h-28 w-full bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <Package className="h-8 w-8 stroke-[1.5]" />
                      </div>
                    )}

                    {/* State Badges */}
                    {product.is_service ? (
                      <span className="absolute top-2 right-2 rounded-md bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5">
                        Service
                      </span>
                    ) : isOut ? (
                      <span className="absolute top-2 right-2 rounded-md bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5">
                        Épuisé
                      </span>
                    ) : isAllHeld ? (
                      <span className="absolute top-2 right-2 rounded-md bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        Réservé ({heldQty})
                      </span>
                    ) : inCartQty > 0 ? (
                      <span className="absolute top-2 right-2 rounded-md bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5">
                        En panier: {inCartQty}
                      </span>
                    ) : null}
                  </div>

                  {/* Card Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-xs line-clamp-2 leading-snug">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {product.category?.name || 'Général'}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-sm font-black text-indigo-700">
                        {product.sell_price.toFixed(2)} DH
                      </span>

                      {!product.is_service && (
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-bold ${
                              remainingSellable <= product.min_stock_level
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}
                          >
                            Dispo: {remainingSellable}
                          </span>
                          {heldQty > 0 && (
                            <div className="text-[9px] text-amber-600/90 font-medium">
                              ({heldQty} réservé)
                            </div>
                          )}
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