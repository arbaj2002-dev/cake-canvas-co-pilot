import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  phone?: string;
  email: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Try to get user data from localStorage on initialization
const getInitialUserData = (): User | null => {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUserData(),
  session: null,
  isAuthenticated: !!getInitialUserData(),
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ session: Session | null; user: User | null }>) => {
      state.session = action.payload.session;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.session;
      state.loading = false;
      
      if (action.payload.user) {
        localStorage.setItem('user_data', JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem('user_data');
      }
    },
    logout: (state) => {
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('user_data');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setSession, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;