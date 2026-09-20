'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types';
import { productSchema, ProductFormValues } from '@/lib/validations/product';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

export function ProductDialog({ open, onOpenChange, categories }: ProductDialogProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      barcode: '',
      category_id: '',
      buy_price: 0,
      sell_price: 0,
      stock_quantity: 0,
      min_stock_level: 5,
      is_service: false,
    },
  });

  const isService = watch('is_service');

  const createProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = {
        name: values.name.trim(),
        barcode: values.barcode?.trim() || null,
        category_id: values.category_id || null,
        buy_price: values.buy_price,
        sell_price: values.sell_price,
        stock_quantity: values.is_service ? 0 : values.stock_quantity,
        min_stock_level: values.min_stock_level,
        is_service: values.is_service,
        is_active: true,
      };

      const { error } = await supabase.from('products').insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
      reset();
    },
    onError: (err: any) => {
      alert(`Erreur: ${err.message}`);
    },
  });

  const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
    createProductMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel Article</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom de l'article *</Label>
            <Input
              id="name"
              placeholder="ex: Cahier 96p Sira, Stylo Bic Bleu"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          {/* Barcode & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="barcode">Code-barres (Optionnel)</Label>
              <Input
                id="barcode"
                placeholder="Scan / EAN / ISBN"
                {...register('barcode')}
              />
              {errors.barcode && (
                <p className="text-xs text-rose-500">{errors.barcode.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category_id">Catégorie</Label>
              <select
                id="category_id"
                {...register('category_id')}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <option value="">Sélectionner</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="buy_price">Prix Achat (DH)</Label>
              <Input
                id="buy_price"
                type="number"
                step="0.10"
                placeholder="0.00"
                {...register('buy_price', { valueAsNumber: true })}
              />
              {errors.buy_price && (
                <p className="text-xs text-rose-500">{errors.buy_price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sell_price">Prix Vente (DH) *</Label>
              <Input
                id="sell_price"
                type="number"
                step="0.10"
                placeholder="0.00"
                {...register('sell_price', { valueAsNumber: true })}
              />
              {errors.sell_price && (
                <p className="text-xs text-rose-500">{errors.sell_price.message}</p>
              )}
            </div>
          </div>

          {/* Service Toggle */}
          <div className="flex items-center space-x-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
            <Checkbox
              id="is_service"
              checked={isService}
              onCheckedChange={(checked) => setValue('is_service', !!checked)}
            />
            <Label htmlFor="is_service" className="text-xs text-slate-700 cursor-pointer">
              C'est un service (Photocopies, impression, reliure...)
            </Label>
          </div>

          {/* Stock Inputs */}
          {!isService && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stock_quantity">Quantité en Stock</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  placeholder="0"
                  {...register('stock_quantity', { valueAsNumber: true })}
                />
                {errors.stock_quantity && (
                  <p className="text-xs text-rose-500">{errors.stock_quantity.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="min_stock_level">Alerte Stock Min.</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  placeholder="5"
                  {...register('min_stock_level', { valueAsNumber: true })}
                />
                {errors.min_stock_level && (
                  <p className="text-xs text-rose-500">{errors.min_stock_level.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enregistrer l'article
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}