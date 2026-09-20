'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { Product, Category } from '@/types';
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
import { Loader2, Camera, X } from 'lucide-react';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  productToEdit?: Product | null;
}

export function ProductDialog({
  open,
  onOpenChange,
  categories,
  productToEdit,
}: ProductDialogProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(productToEdit);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  // When dialog opens or productToEdit changes, pre-fill form
  useEffect(() => {
    if (open) {
      if (productToEdit) {
        setValue('name', productToEdit.name);
        setValue('barcode', productToEdit.barcode || '');
        setValue('category_id', productToEdit.category_id || '');
        setValue('buy_price', productToEdit.buy_price);
        setValue('sell_price', productToEdit.sell_price);
        setValue('stock_quantity', productToEdit.stock_quantity);
        setValue('min_stock_level', productToEdit.min_stock_level);
        setValue('is_service', productToEdit.is_service);
        setImagePreview(productToEdit.image_url || null);
      } else {
        reset({
          name: '',
          barcode: '',
          category_id: '',
          buy_price: 0,
          sell_price: 0,
          stock_quantity: 0,
          min_stock_level: 5,
          is_service: false,
        });
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [open, productToEdit, reset, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) {
      console.error('Erreur upload:', error);
      return null;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Upsert (Insert or Update)
  const saveProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      setIsUploadingImage(true);

      let finalImageUrl = productToEdit?.image_url || null;

      // If user selected a new file, upload it
      if (imageFile) {
        finalImageUrl = await uploadImageToStorage(imageFile);
      } else if (!imagePreview) {
        // If user explicitly removed image
        finalImageUrl = null;
      }

      const payload = {
        name: values.name.trim(),
        barcode: values.barcode?.trim() || null,
        category_id: values.category_id || null,
        buy_price: values.buy_price,
        sell_price: values.sell_price,
        stock_quantity: values.is_service ? 0 : values.stock_quantity,
        min_stock_level: values.min_stock_level,
        is_service: values.is_service,
        image_url: finalImageUrl,
        is_active: true,
      };

      if (isEditMode && productToEdit) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }

      setIsUploadingImage(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
      reset();
      removeImage();
    },
    onError: (err: any) => {
      setIsUploadingImage(false);
      alert(`Erreur: ${err.message}`);
    },
  });

  const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
    saveProductMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Modifier l'Article" : 'Nouvel Article'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Image Picker */}
          <div>
            <Label className="block text-xs font-medium text-slate-700 mb-1.5">
              Photo de l'article
            </Label>
            {imagePreview ? (
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-28 w-full border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-indigo-50/30 transition-colors">
                <Camera className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-600">
                  Prendre une photo ou importer
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

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
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="min_stock_level">Alerte Stock Min.</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  placeholder="5"
                  {...register('min_stock_level', { valueAsNumber: true })}
                />
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
              disabled={saveProductMutation.isPending || isUploadingImage}
            >
              {(saveProductMutation.isPending || isUploadingImage) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Enregistrer les modifications' : "Enregistrer l'article"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}