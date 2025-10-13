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
}

const initialState: CartState = {
  items: [],
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
    },
  },
});

export const { addToCart, removeFromCart, updateCartItemQuantity, updateCartItemAddons, clearCart } = cartSlice.actions;
export default cartSlice.reducer;