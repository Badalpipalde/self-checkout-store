import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  localStorage.setItem('cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromStorage(),
    loading: false,
  },
  reducers: {
    addItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.product._id === product._id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      saveCartToStorage(state.items);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.product._id !== action.payload);
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.product._id !== productId);
        } else {
          item.quantity = quantity;
        }
      }
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
    syncCart: (state, action) => {
      state.items = action.payload;
      saveCartToStorage(state.items);
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, syncCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
export const selectCartGST = (state) => selectCartSubtotal(state) * 0.18;
export const selectCartTotal = (state) => selectCartSubtotal(state) + selectCartGST(state);

export default cartSlice.reducer;
