import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { errorCodesAPI } from '../../services/api';

export const fetchErrorCodes = createAsyncThunk('errorCodes/fetchAll', async (params, thunkAPI) => {
  try {
    return await errorCodesAPI.getAll(params);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const createErrorCode = createAsyncThunk('errorCodes/create', async (data, thunkAPI) => {
  try {
    const res = await errorCodesAPI.create(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateErrorCodeAsync = createAsyncThunk('errorCodes/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await errorCodesAPI.update(id, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteErrorCodeAsync = createAsyncThunk('errorCodes/delete', async (id, thunkAPI) => {
  try {
    await errorCodesAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const errorCodesSlice = createSlice({
  name: 'errorCodes',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 100, total: 0, pages: 0 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchErrorCodes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchErrorCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchErrorCodes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createErrorCode.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateErrorCodeAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteErrorCodeAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default errorCodesSlice.reducer;
