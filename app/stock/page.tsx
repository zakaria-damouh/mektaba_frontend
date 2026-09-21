'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Product, Category } from '@/types';

import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

import { StockKpiCards } from '@/components/stock/stock-kpi-cards';
import { ProductDialog } from '@/components/stock/product-dialog';
import { ProductDetailsDialog } from '@/components/stock/product-details-dialog';
import { ProductFilters, FilterTab, ViewMode } from '@/components/stock/product-filters';
import { ProductList } from '@/components/stock/product-list';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function StockPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productForDetails, setProductForDetails] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Delete Alert Dialog
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  
// 3. Upgraded Stock Adjust Mutation (Supports Delta & Set Exact)
  const quickStockMutation = useMutation({
    mutationFn: async ({
      id,
      delta,
      setExact,
    }: {
      id: string;
      delta?: number;
      setExact?: number;
    }) => {
      const current = products.find((p) => p.id === id);
      if (!current) return;

      let newQty = current.stock_quantity;
      if (setExact !== undefined) {
        newQty = Math.max(0, setExact);
      } else if (delta !== undefined) {
        newQty = Math.max(0, current.stock_quantity + delta);
      }

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

  // 4. Inline Price Update Mutation
  const inlinePriceMutation = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: string;
      field: 'sell_price' | 'buy_price';
      value: number;
    }) => {
      const { error } = await supabase
        .from('products')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      alert(`Erreur de mise à jour: ${err.message}`);
    },
  });

  // 5. Soft Delete Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (err: any) => {
      alert(`Erreur de suppression: ${err.message}`);
    },
  });

  // Handlers
  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (product: Product) => {
    setProductForDetails(product);
    setIsDetailsOpen(true);
  };

  const handleTriggerDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  // KPI Calculations
  const totalInventoryValue = products
    .filter((p) => !p.is_service)
    .reduce((acc, p) => acc + p.buy_price * p.stock_quantity, 0);

  const outOfStockCount = products.filter(
    (p) => !p.is_service && p.stock_quantity <= 0
  ).length;

  const lowStockCount = products.filter(
    (p) => !p.is_service && p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level
  ).length;

  const servicesCount = products.filter((p) => p.is_service).length;

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));

    const matchesCat =
      selectedCategory === 'all' || p.category_id === selectedCategory;

    let matchesTab = true;
    if (activeTab === 'out_of_stock') {
      matchesTab = !p.is_service && p.stock_quantity <= 0;
    } else if (activeTab === 'low_stock') {
      matchesTab =
        !p.is_service &&
        p.stock_quantity > 0 &&
        p.stock_quantity <= p.min_stock_level;
    } else if (activeTab === 'services') {
      matchesTab = p.is_service;
    }

    return matchesSearch && matchesCat && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventaire & Stock
          </h1>
          <p className="text-sm text-slate-500">
            Suivi des articles, alertes et valeur du magasin
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Ajouter un Article
        </Button>
      </div>

      {/* 1. UPGRADE A: Interactive KPI Header */}
      <StockKpiCards
        totalCount={products.length}
        outOfStockCount={outOfStockCount}
        lowStockCount={lowStockCount}
        totalInventoryValue={totalInventoryValue}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Add / Edit Modal */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categories={categories}
        productToEdit={productToEdit}
      />

      {/* Product Details Modal */}
      <ProductDetailsDialog
        product={productForDetails}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={handleEdit}
        onDelete={handleTriggerDelete}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <AlertDialogTitle>Supprimer l'article ?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-slate-600">
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-semibold text-slate-900">
                "{productToDelete?.name}"
              </span>{' '}
              ? L'article sera archivé, mais vos anciens tickets resteront intacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProductMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteProductMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              {deleteProductMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Confirmer la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filters Toolbar with Keyboard Shortcut ('/') */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        servicesCount={servicesCount}
        categories={categories}
      />

     {/* Products Display (Table / Squares) */}
      <ProductList
        products={filteredProducts}
        isLoading={isLoading}
        viewMode={viewMode}
        onAdjustStock={quickStockMutation.mutate}
        onUpdatePrice={inlinePriceMutation.mutateAsync}
        onViewDetails={handleViewDetails}
        onEditProduct={handleEdit}
        onDeleteProduct={handleTriggerDelete}
      />
    </div>
  );
}