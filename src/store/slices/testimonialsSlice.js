import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { testimonialsAPI } from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────
export const fetchTestimonials = createAsyncThunk('testimonials/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await testimonialsAPI.getAll(params);
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const createTestimonial = createAsyncThunk('testimonials/create', async (data, thunkAPI) => {
  try {
    const res = await testimonialsAPI.create(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteTestimonialAsync = createAsyncThunk('testimonials/delete', async (id, thunkAPI) => {
  try {
    await testimonialsAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// ─── Slice ───────────────────────────────────────────────────
const testimonialsSlice = createSlice({
  name: 'testimonials',
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestimonials.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTestimonials.fulfilled, (state, action) => { 
        state.loading = false; 
        state.items = action.payload.data; 
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTestimonials.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createTestimonial.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(deleteTestimonialAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload && t.id !== action.payload);
      });
  },
});

export default testimonialsSlice.reducer;
