'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Product, Category } from '@/types';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { ProductDialog } from '@/components/stock/product-dialog';
import { ProductFilters, FilterTab } from '@/components/stock/product-filters';
import { ProductList } from '@/components/stock/product-list';

export default function StockPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Fetch Categories
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

  // 2. Fetch Products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  // 3. Quick Stock Adjust Mutation
  const quickStockMutation = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      const current = products.find((p) => p.id === id);
      if (!current) return;
      const newQty = Math.max(0, current.stock_quantity + delta);

      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newQty })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Filter Logic
  const lowStockCount = products.filter(
    (p) => !p.is_service && p.stock_quantity <= p.min_stock_level
  ).length;
  const servicesCount = products.filter((p) => p.is_service).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCat =
      selectedCategory === 'all' || p.category_id === selectedCategory;

    let matchesTab = true;
    if (activeTab === 'low_stock') {
      matchesTab = !p.is_service && p.stock_quantity <= p.min_stock_level;
    } else if (activeTab === 'services') {
      matchesTab = p.is_service;
    }

    return matchesSearch && matchesCat && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventaire & Stock
          </h1>
          <p className="text-sm text-slate-500">
            {products.length} articles au catalogue
          </p>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Ajouter un Article
        </Button>
      </div>

      {/* Add Product Modal */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categories={categories}
      />

      {/* Filters Toolbar */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCount={products.length}
        lowStockCount={lowStockCount}
        servicesCount={servicesCount}
        categories={categories}
      />

      {/* Products Display (Table/Cards) */}
      <ProductList
        products={filteredProducts}
        isLoading={isLoading}
        onAdjustStock={(id, delta) => quickStockMutation.mutate({ id, delta })}
      />
    </div>
  );
}