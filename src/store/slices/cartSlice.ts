import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;
  productId: string;
  sizeId: string;
  name: string;
  basePrice: number;
  imageUrl: string;
  size: string;
  customMessage?: string;
  addons: CartAddon[];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: {
    code: string;
    discountAmount: number;
  } | null;
}

const initialState: CartState = {
  items: [],
  appliedCoupon: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.addons = action.payload.addons;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    updateCartItemAddons: (state, action: PayloadAction<{ id: string; addons: CartAddon[] }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.addons = action.payload.addons;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
    },
    applyCoupon: (state, action: PayloadAction<{ code: string; discountAmount: number }>) => {
      state.appliedCoupon = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
    },
  },
});

export const { addToCart, removeFromCart, updateCartItemQuantity, updateCartItemAddons, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;