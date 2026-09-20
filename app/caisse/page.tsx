'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Product, Category } from '@/types';
import { ProductGrid } from '@/components/caisse/product-grid';
import { CartPanel } from '@/components/caisse/cart-panel';

export default function CaissePage() {
  const supabase = createClient();

  // Fetch Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch active products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col md:flex-row gap-4">
      {/* Left: Product Catalog (60-65% width on desktop) */}
      <div className="flex-1 md:w-3/5 lg:w-2/3 h-full overflow-hidden">
        <ProductGrid
          products={products}
          categories={categories}
          isLoading={isLoading}
        />
      </div>

      {/* Right: Cart & Checkout Panel (35-40% width on desktop) */}
      <div className="w-full md:w-2/5 lg:w-1/3 h-full overflow-hidden">
        <CartPanel />
      </div>
    </div>
  );
}