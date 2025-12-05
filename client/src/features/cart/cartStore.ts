import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
}

export interface CartStore extends CartState {
  // Actions
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setLoading: (isLoading: boolean) => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,

        // Actions
        addItem: (item) => {
          const items = get().items;
          const existingItem = items.find(
            (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
          );

          if (existingItem) {
            get().updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
          } else {
            const newItem: CartItem = {
              ...item,
              id: `${item.productId}_${item.size}_${item.color}_${Date.now()}`,
            };
            set((state) => ({
              items: [...state.items, newItem],
            }));
            get().calculateTotals();
          }
        },

        removeItem: (id) => {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
          get().calculateTotals();
        },

        updateQuantity: (id, quantity) => {
          if (quantity <= 0) {
            get().removeItem(id);
            return;
          }

          set((state) => ({
            items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
          }));
          get().calculateTotals();
        },

        clearCart: () => {
          set({
            items: [],
            total: 0,
            itemCount: 0,
          });
        },

        setLoading: (isLoading) => set({ isLoading }),

        calculateTotals: () => {
          const items = get().items;
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

          set({ total, itemCount });
        },
      }),
      {
        name: "cart-storage",
        // Persist cart items and totals
        partialize: (state) => ({
          items: state.items,
          total: state.total,
          itemCount: state.itemCount,
        }),
      }
    ),
    {
      name: "cart-store",
    }
  )
);
