import { create } from 'zustand';
import { Product, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  discount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  notes: string;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'transfer') => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemQuantityInCart: (productId: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  paymentMethod: 'cash',
  notes: '',

  addItem: (product: Product) => {
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);

      // Check available physical stock
      if (!product.is_service) {
        const currentQty = existing ? existing.quantity : 0;
        if (currentQty >= product.stock_quantity) {
          // Cannot add more than in stock!
          return state;
        }
      }

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { product, quantity: 1, unit_price: product.sell_price }],
      };
    });
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    const currentItem = get().items.find((item) => item.product.id === productId);
    if (!currentItem) return;

    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    // Cap at available stock
    let safeQuantity = quantity;
    if (!currentItem.product.is_service && quantity > currentItem.product.stock_quantity) {
      safeQuantity = currentItem.product.stock_quantity;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity: safeQuantity } : item
      ),
    }));
  },

  setDiscount: (discount: number) => set({ discount: Math.max(0, discount) }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setNotes: (notes: string) => set({ notes }),
  clearCart: () => set({ items: [], discount: 0, notes: '', paymentMethod: 'cash' }),

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    return Math.max(0, subtotal - get().discount);
  },

  getItemQuantityInCart: (productId: string) => {
    const found = get().items.find((item) => item.product.id === productId);
    return found ? found.quantity : 0;
  },
}));