import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────
export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await productsAPI.getAll(params);
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const createProduct = createAsyncThunk('products/create', async (data, thunkAPI) => {
  try {
    const res = await productsAPI.create(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteProductAsync = createAsyncThunk('products/delete', async (id, thunkAPI) => {
  try {
    await productsAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateProductAsync = createAsyncThunk('products/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await productsAPI.update(id, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id, thunkAPI) => {
  try {
    const res = await productsAPI.getOne(id);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});
// ─── Slice ───────────────────────────────────────────────────
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selectedProduct: null,
    selectedLoading: false,
    selectedError: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null,
  },
  reducers: {
    // Keep local sync actions for immediate UI updates
    addProduct: (state, action) => { state.items.push(action.payload); },
    removeProduct: (state, action) => { state.items = state.items.filter(p => p._id !== action.payload && p.id !== action.payload); },
    updateProduct: (state, action) => {
      const index = state.items.findIndex(p => p._id === action.payload._id || p.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => { 
        state.loading = false; 
        state.items = action.payload.data; 
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // createProduct
      .addCase(createProduct.fulfilled, (state, action) => { state.items.push(action.payload); })
      // updateProduct
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id || p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // deleteProduct
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload && p.id !== action.payload);
      })
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => { state.selectedLoading = true; state.selectedError = null; state.selectedProduct = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.selectedLoading = false; state.selectedProduct = action.payload; })
      .addCase(fetchProductById.rejected, (state, action) => { state.selectedLoading = false; state.selectedError = action.payload; });
  },
});

export const { addProduct, removeProduct, updateProduct } = productsSlice.actions;
export default productsSlice.reducer;
