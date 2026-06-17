import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { servicesAPI } from '../../services/api';

export const fetchServices = createAsyncThunk('services/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await servicesAPI.getAll(params);
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const createService = createAsyncThunk('services/create', async (data, thunkAPI) => {
  try {
    const res = await servicesAPI.create(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteServiceAsync = createAsyncThunk('services/delete', async (id, thunkAPI) => {
  try {
    await servicesAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateServiceAsync = createAsyncThunk('services/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await servicesAPI.update(id, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const servicesSlice = createSlice({
  name: 'services',
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
      .addCase(fetchServices.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchServices.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createService.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(deleteServiceAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s._id !== action.payload && s.id !== action.payload);
      })
      .addCase(updateServiceAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(s => s._id === action.payload._id || s.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export default servicesSlice.reducer;
