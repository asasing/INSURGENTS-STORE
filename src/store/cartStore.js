import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,

      addItem: (product, quantity = 1, selectedSize = null, selectedColor = null) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.id === product.id &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor
          )

          if (existingIndex >= 0) {
            const updatedItems = [...state.items]
            updatedItems[existingIndex].quantity += quantity
            return { items: updatedItems }
          }

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity,
                selectedSize,
                selectedColor,
                cartItemId: `${product.id}-${selectedSize}-${selectedColor}-${Date.now()}`
              }
            ]
          }
        }),

      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId)
        })),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          )
        })),

      updateSize: (cartItemId, newSize) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, selectedSize: newSize }
              : item
          )
        })),

      clearCart: () => set({ items: [], promoCode: null }),

      // Promo code methods
      setPromoCode: (promoCode) => set({ promoCode }),

      clearPromoCode: () => set({ promoCode: null }),

      // Get subtotal (before promo discount)
      getTotal: () => {
        const items = get().items
        return items.reduce((total, item) => {
          const price = item.sale_price || item.price
          return total + price * item.quantity
        }, 0)
      },

      // Alias for getTotal for clarity
      getSubtotal: () => get().getTotal(),

      // Calculate total product discount amount
      getTotalProductDiscount: () => {
        const items = get().items
        return items.reduce((total, item) => {
          if (item.sale_price && item.sale_price < item.price) {
            const discountPerItem = item.price - item.sale_price
            return total + discountPerItem * item.quantity
          }
          return total
        }, 0)
      },

      getItemCount: () => {
        const items = get().items
        return items.reduce((total, item) => total + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)
