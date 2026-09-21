export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  sku: string | null;
  category_id: string | null;
  category?: Category;
  buy_price: number;
  sell_price: number;
  stock_quantity: number;
  min_stock_level: number;
  is_service: boolean;
  is_active: boolean;
  image_url?: string | null; // <-- Added this
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  is_custom?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  notes?: string | null;
  current_debt: number;
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  id: string;
  customer_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer';
  notes?: string | null;
  created_at: string;
}