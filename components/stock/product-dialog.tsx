'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { TbCamera, TbX, TbLoader2, TbSparkles } from 'react-icons/tb';

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
  const { t } = useTranslation();
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

  const saveProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      setIsUploadingImage(true);

      let finalImageUrl = productToEdit?.image_url || null;

      if (imageFile) {
        finalImageUrl = await uploadImageToStorage(imageFile);
      } else if (!imagePreview) {
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
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto border border-neutral-200/90">
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <DialogTitle className="text-lg font-black tracking-tight text-neutral-900">
            {isEditMode ? t('stock.editItem') : t('stock.newItem')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          <div>
            <Label className="block text-xs font-bold text-neutral-700 mb-1.5">
              {t('stock.photoLabel')}
            </Label>
            {imagePreview ? (
              <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="h-full w-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2.5 end-2.5 h-7 w-7 rounded-full bg-neutral-900/80 text-white flex items-center justify-center hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  <TbX className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-28 w-full border-2 border-dashed border-neutral-200 hover:border-emerald-500 rounded-2xl cursor-pointer bg-neutral-50/60 hover:bg-emerald-50/40 transition-colors duration-200">
                <TbCamera className="h-6 w-6 text-neutral-400 mb-1 stroke-[1.8]" />
                <span className="text-xs font-bold text-neutral-700">
                  {t('stock.uploadPhoto')}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">{t('stock.photoHint')}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold text-neutral-700">
              {t('stock.productName')}
            </Label>
            <Input
              id="name"
              placeholder={t('stock.productNamePlh')}
              className="rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600 text-xs"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="barcode" className="text-xs font-bold text-neutral-700">
                {t('stock.barcode')}
              </Label>
              <Input
                id="barcode"
                placeholder={t('stock.barcodePlh')}
                className="rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600 text-xs font-mono"
                {...register('barcode')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category_id" className="text-xs font-bold text-neutral-700">
                {t('stock.category')}
              </Label>
              <select
                id="category_id"
                {...register('category_id')}
                className="flex h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-800 shadow-2xs focus:border-emerald-600 focus:outline-hidden cursor-pointer"
              >
                <option value="">{t('stock.selectCat')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="buy_price" className="text-xs font-bold text-neutral-700">
                {t('stock.buyPrice')} ({t('common.dh')})
              </Label>
              <Input
                id="buy_price"
                type="number"
                step="0.10"
                placeholder="0.00"
                className="rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600 text-xs font-bold"
                {...register('buy_price', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sell_price" className="text-xs font-bold text-neutral-700">
                {t('stock.sellPrice')} ({t('common.dh')}) *
              </Label>
              <Input
                id="sell_price"
                type="number"
                step="0.10"
                placeholder="0.00"
                className="rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600 text-xs font-black text-neutral-900"
                {...register('sell_price', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2.5 rtl:space-x-reverse rounded-2xl border border-neutral-200/80 p-3 bg-neutral-50/60">
            <Checkbox
              id="is_service"
              checked={isService}
              onCheckedChange={(checked) => setValue('is_service', !!checked)}
            />
            <Label htmlFor="is_service" className="text-xs font-semibold text-neutral-700 cursor-pointer flex items-center gap-1.5">
              <TbSparkles className="h-3.5 w-3.5 text-emerald-600" />
              {t('stock.isServiceLabel')}
            </Label>
          </div>

          {!isService && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stock_quantity" className="text-xs font-bold text-neutral-700">
                  {t('stock.stockQty')}
                </Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  placeholder="0"
                  className="rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600 text-xs font-bold"
                  {...register('stock_quantity', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="min_stock_level" className="text-xs font-bold text-neutral-700">
                  {t('stock.minStockAlert')}
                </Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  placeholder="5"
                  className="rounded-xl border-neutral-200 focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600 text-xs font-bold"
                  {...register('min_stock_level', { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-5 text-xs font-bold border-neutral-200 hover:bg-neutral-100"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="rounded-full px-6 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 cursor-pointer"
              disabled={saveProductMutation.isPending || isUploadingImage}
            >
              {(saveProductMutation.isPending || isUploadingImage) && (
                <TbLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('common.save') : t('stock.addItem')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}