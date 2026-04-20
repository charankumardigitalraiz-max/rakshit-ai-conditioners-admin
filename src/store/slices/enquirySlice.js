import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enquiryAPI } from '../../services/api';

export const fetchEnquiries = createAsyncThunk('enquiries/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await enquiryAPI.getAll(params);
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateEnquiryStatusAsync = createAsyncThunk('enquiries/updateStatus', async ({ id, status }, thunkAPI) => {
  try {
    const res = await enquiryAPI.updateStatus(id, status);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteEnquiryAsync = createAsyncThunk('enquiries/delete', async (id, thunkAPI) => {
  try {
    await enquiryAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const enquirySlice = createSlice({
  name: 'enquiries',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnquiries.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateEnquiryStatusAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteEnquiryAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload);
      });
  },
});

export default enquirySlice.reducer;
