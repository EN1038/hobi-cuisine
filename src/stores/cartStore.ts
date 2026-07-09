// ============================================================
// HOBI Cuisine — Cart Store (Zustand)
// ============================================================

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, OrderType } from '@/types';

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: string;
  deliveryAddress: string;
  deliveryFee: number;
  promoCode: string;
  promoDiscount: number;
  promoDescription: string;
  usePoints: boolean;
  pointsToRedeem: number;
  notes: string;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (table: string) => void;
  setDeliveryAddress: (address: string) => void;
  setPromo: (code: string, discount: number, description: string) => void;
  clearPromo: () => void;
  setUsePoints: (use: boolean, points: number) => void;
  setNotes: (notes: string) => void;

  // Computed
  getSubtotal: () => number;
  getVAT: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getPointsDiscount: () => number;
}

const DELIVERY_FEE = 40; // ค่าส่ง ฿40
const VAT_RATE = 0.07;
const POINTS_TO_THB = 0.1; // 100 แต้ม = ฿10

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: 'dine-in',
      tableNumber: '',
      deliveryAddress: '',
      deliveryFee: 0,
      promoCode: '',
      promoDiscount: 0,
      promoDescription: '',
      usePoints: false,
      pointsToRedeem: 0,
      notes: '',

      addItem: (item) => {
        set((state) => {
          // Check if same item with same options exists
          const existingIndex = state.items.findIndex(
            (i) =>
              i.menuItemId === item.menuItemId &&
              JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions) &&
              JSON.stringify(i.selectedAddons) === JSON.stringify(item.selectedAddons)
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + item.quantity,
              totalPrice:
                (updated[existingIndex].quantity + item.quantity) *
                (item.totalPrice / item.quantity),
            };
            return { items: updated };
          }

          return { items: [...state.items, item] };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === cartItemId
              ? { ...i, quantity, totalPrice: (i.totalPrice / i.quantity) * quantity }
              : i
          ),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          promoCode: '',
          promoDiscount: 0,
          promoDescription: '',
          usePoints: false,
          pointsToRedeem: 0,
          notes: '',
          tableNumber: '',
          deliveryAddress: '',
          deliveryFee: 0,
        });
      },

      setOrderType: (type) => {
        set({
          orderType: type,
          deliveryFee: type === 'delivery' ? DELIVERY_FEE : 0,
          tableNumber: type !== 'dine-in' ? '' : get().tableNumber,
          deliveryAddress: type !== 'delivery' ? '' : get().deliveryAddress,
        });
      },

      setTableNumber: (table) => set({ tableNumber: table }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),

      setPromo: (code, discount, description) =>
        set({ promoCode: code, promoDiscount: discount, promoDescription: description }),

      clearPromo: () =>
        set({ promoCode: '', promoDiscount: 0, promoDescription: '' }),

      setUsePoints: (use, points) =>
        set({ usePoints: use, pointsToRedeem: points }),

      setNotes: (notes) => set({ notes }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      getPointsDiscount: () => {
        const { usePoints, pointsToRedeem } = get();
        if (!usePoints) return 0;
        return pointsToRedeem * POINTS_TO_THB;
      },

      getVAT: () => {
        const subtotal = get().getSubtotal();
        const discount = get().promoDiscount + get().getPointsDiscount();
        return Math.round((subtotal - discount) * VAT_RATE);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().promoDiscount + get().getPointsDiscount();
        const vat = get().getVAT();
        const delivery = get().deliveryFee;
        return Math.max(0, subtotal - discount + vat + delivery);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'hobi-cart',
    }
  )
);
