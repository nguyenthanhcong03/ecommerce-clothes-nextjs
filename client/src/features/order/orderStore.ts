import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
  }[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

export interface OrderStore extends OrderState {
  // Actions
  setOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>()(
  devtools(
    (set) => ({
      // Initial state
      orders: [],
      currentOrder: null,
      isLoading: false,
      error: null,

      // Actions
      setOrders: (orders) => set({ orders }),

      setCurrentOrder: (order) => set({ currentOrder: order }),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      updateOrder: (id, updates) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === id ? { ...order, ...updates } : order)),
          currentOrder: state.currentOrder?.id === id ? { ...state.currentOrder, ...updates } : state.currentOrder,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearOrders: () =>
        set({
          orders: [],
          currentOrder: null,
        }),
    }),
    {
      name: "order-store",
    }
  )
);
