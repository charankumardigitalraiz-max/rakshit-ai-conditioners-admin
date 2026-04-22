import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clientsAPI } from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────
export const fetchClients = createAsyncThunk('clients/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await clientsAPI.getAll(params);
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const createClient = createAsyncThunk('clients/create', async (data, thunkAPI) => {
  try {
    const res = await clientsAPI.create(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteClientAsync = createAsyncThunk('clients/delete', async (id, thunkAPI) => {
  try {
    await clientsAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateClientAsync = createAsyncThunk('clients/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await clientsAPI.update(id, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// ─── Slice ───────────────────────────────────────────────────
const clientsSlice = createSlice({
  name: 'clients',
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClients.fulfilled, (state, action) => { 
        state.loading = false; 
        state.items = action.payload.data; 
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchClients.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createClient.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(deleteClientAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c._id !== action.payload && c.id !== action.payload);
      })
      .addCase(updateClientAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c._id === action.payload._id || c.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export default clientsSlice.reducer;
