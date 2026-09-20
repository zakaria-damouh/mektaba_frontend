'use client';

import { useState } from 'react';
import { Product, Category } from '@/types';
import { useCartStore } from '@/store/use-cart-store';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, AlertTriangle, Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
}

export function ProductGrid({ products, categories, isLoading }: ProductGridProps) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const addItem = useCartStore((state) => state.addItem);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchesCat = selectedCat === 'all' || p.category_id === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search & Category Tabs */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher un article ou scanner code-barres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        {/* Category horizontal scroll bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              selectedCat === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
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
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                selectedCat === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
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
              const isLow =
                !product.is_service &&
                product.stock_quantity <= product.min_stock_level;
              const isOut = !product.is_service && product.stock_quantity <= 0;

              return (
                <button
                key={product.id}
                type="button"
                onClick={() => !isOut && addItem(product)}
                disabled={isOut}
                className={`group flex flex-col justify-between text-left rounded-2xl border bg-white overflow-hidden shadow-xs transition-all hover:border-indigo-400 hover:shadow-sm active:scale-[0.98] ${
                    isOut
                    ? 'opacity-50 cursor-not-allowed border-slate-200'
                    : 'border-slate-200 cursor-pointer'
                }`}
                >
                {/* Product Image or Fallback Placeholder */}
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

                    {/* Service badge overlay */}
                    {product.is_service && (
                    <span className="absolute top-2 right-2 rounded-md bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5">
                        Service
                    </span>
                    )}
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
                        <span className={`text-[10px] font-bold ${
                        isLow ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                        x{product.stock_quantity}
                        </span>
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