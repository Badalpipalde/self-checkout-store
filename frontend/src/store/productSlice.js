import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'product',
  initialState: {
    scannedProduct: null,
    products: [],
    loading: false,
    error: null,
  },
  reducers: {
    setScannedProduct: (state, action) => { state.scannedProduct = action.payload; },
    clearScannedProduct: (state) => { state.scannedProduct = null; },
    setProducts: (state, action) => { state.products = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setScannedProduct, clearScannedProduct, setProducts, setLoading, setError } = productSlice.actions;
export default productSlice.reducer;
