import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contactAPI } from '../../services/api';

export const fetchContacts = createAsyncThunk('contacts/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await contactAPI.getAll(params);
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateContactStatusAsync = createAsyncThunk('contacts/updateStatus', async ({ id, status }, thunkAPI) => {
  try {
    const res = await contactAPI.updateStatus(id, status);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteContactAsync = createAsyncThunk('contacts/delete', async (id, thunkAPI) => {
  try {
    await contactAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const contactSlice = createSlice({
  name: 'contacts',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContacts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateContactStatusAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteContactAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload);
      });
  },
});

export default contactSlice.reducer;
