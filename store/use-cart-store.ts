import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem } from '@/types';

export interface HeldCart {
  id: string;
  items: CartItem[];
  discount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  notes: string;
  total: number;
  createdAt: Date;
}

interface CartState {
  items: CartItem[];
  discount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  notes: string;
  heldCarts: HeldCart[];
  addItem: (product: Product) => void;
  addCustomItem: (name: string, price: number, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'transfer') => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemQuantityInCart: (productId: string) => number;
  getHeldQuantity: (productId: string) => number; // Units locked in held carts
  getAvailableStock: (product: Product) => number; // Stock remaining for new sales
  holdCurrentCart: () => void;
  resumeHeldCart: (heldCartId: string) => void;
  deleteHeldCart: (heldCartId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      paymentMethod: 'cash',
      notes: '',
      heldCarts: [],

      // Calculate how many units are locked in held carts
      getHeldQuantity: (productId: string) => {
        return get().heldCarts.reduce((total, cart) => {
          const item = cart.items.find((i) => i.product.id === productId);
          return total + (item ? item.quantity : 0);
        }, 0);
      },

      // Calculate effective available stock (accounting for held carts)
      getAvailableStock: (product: Product) => {
        if (product.is_service) return 99999;
        const heldQty = get().getHeldQuantity(product.id);
        return Math.max(0, product.stock_quantity - heldQty);
      },

      addItem: (product: Product) => {
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);
          const currentInCart = existing ? existing.quantity : 0;

          // Check against available stock (Physical Stock - Held Carts)
          if (!product.is_service) {
            const available = get().getAvailableStock(product);
            if (currentInCart >= available) {
              // Cannot exceed stock after accounting for held carts!
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
            items: [
              ...state.items,
              { product, quantity: 1, unit_price: product.sell_price, is_custom: false },
            ],
          };
        });
      },

      addCustomItem: (name: string, price: number, quantity = 1) => {
        const customId = `custom_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const virtualProduct: Product = {
          id: customId,
          name: name.trim() || 'Article Divers',
          barcode: null,
          sku: null,
          category_id: null,
          buy_price: 0,
          sell_price: price,
          stock_quantity: 99999,
          min_stock_level: 0,
          is_service: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          items: [
            ...state.items,
            { product: virtualProduct, quantity, unit_price: price, is_custom: true },
          ],
        }));
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

        let safeQuantity = quantity;
        if (!currentItem.product.is_service) {
          const available = get().getAvailableStock(currentItem.product);
          if (quantity > available) {
            safeQuantity = available;
          }
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

      holdCurrentCart: () => {
        const { items, discount, paymentMethod, notes, getTotal } = get();
        if (items.length === 0) return;

        const newHeldCart: HeldCart = {
          id: `held_${Date.now()}`,
          items,
          discount,
          paymentMethod,
          notes,
          total: getTotal(),
          createdAt: new Date(),
        };

        set((state) => ({
          heldCarts: [newHeldCart, ...state.heldCarts],
          items: [],
          discount: 0,
          notes: '',
          paymentMethod: 'cash',
        }));
      },

      resumeHeldCart: (heldCartId: string) => {
        const { items, discount, paymentMethod, notes, heldCarts, getTotal } = get();
        const target = heldCarts.find((c) => c.id === heldCartId);
        if (!target) return;

        let updatedHeldList = heldCarts.filter((c) => c.id !== heldCartId);

        if (items.length > 0) {
          const currentAsHeld: HeldCart = {
            id: `held_${Date.now()}`,
            items,
            discount,
            paymentMethod,
            notes,
            total: getTotal(),
            createdAt: new Date(),
          };
          updatedHeldList = [currentAsHeld, ...updatedHeldList];
        }

        set({
          items: target.items,
          discount: target.discount,
          paymentMethod: target.paymentMethod,
          notes: target.notes,
          heldCarts: updatedHeldList,
        });
      },

      deleteHeldCart: (heldCartId: string) => {
        set((state) => ({
          heldCarts: state.heldCarts.filter((c) => c.id !== heldCartId),
        }));
      },
    }),
    {
      name: 'maktaba-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        discount: state.discount,
        paymentMethod: state.paymentMethod,
        notes: state.notes,
        heldCarts: state.heldCarts,
      }),
    }
  )
);