import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  barcode: z.string().optional(),
  category_id: z.string().optional(),
  buy_price: z.number().min(0, 'Le prix d’achat doit être positif'),
  sell_price: z.number().min(0, 'Le prix de vente doit être positif'),
  stock_quantity: z.number().int().min(0, 'La quantité doit être positive'),
  min_stock_level: z.number().int().min(0, 'Le niveau doit être positif'),
  is_service: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;