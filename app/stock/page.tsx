'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Product, Category } from '@/types';

import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

import { ProductDialog } from '@/components/stock/product-dialog';
import { ProductDetailsDialog } from '@/components/stock/product-details-dialog';
import { ProductFilters, FilterTab, ViewMode } from '@/components/stock/product-filters';
import { ProductList } from '@/components/stock/product-list';

// shadcn AlertDialog
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

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productForDetails, setProductForDetails] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Delete Alert Dialog state
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

  // 2. Fetch Active Products
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

  // 4. Soft Delete (Archive) Mutation
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
          onClick={handleOpenAdd}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Ajouter un Article
        </Button>
      </div>

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
              ? L'article sera archivé et masqué de la caisse, mais vos anciens tickets de caisse resteront intacts.
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

      {/* Filters Toolbar */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={products.length}
        lowStockCount={lowStockCount}
        servicesCount={servicesCount}
        categories={categories}
      />

      {/* Products Display (Table / Squares) */}
      <ProductList
        products={filteredProducts}
        isLoading={isLoading}
        viewMode={viewMode}
        onAdjustStock={(id, delta) => quickStockMutation.mutate({ id, delta })}
        onViewDetails={handleViewDetails}
        onEditProduct={handleEdit}
        onDeleteProduct={handleTriggerDelete}
      />
    </div>
  );
}