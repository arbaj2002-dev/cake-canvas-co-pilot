import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoriteCake {
  id: string;
  name: string;
  basePrice: number;
  imageUrl: string;
  category?: string;
}

interface FavoritesState {
  items: FavoriteCake[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<FavoriteCake>) => {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setFavorites: (state, action: PayloadAction<FavoriteCake[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addToFavorites, removeFromFavorites, setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;