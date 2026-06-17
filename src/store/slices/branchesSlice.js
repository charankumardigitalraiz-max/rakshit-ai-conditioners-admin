import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { branchesAPI, contactChannelsAPI } from '../../services/api';

export const fetchBranches = createAsyncThunk('branches/fetchAll', async (params, thunkAPI) => {
  try {
    return await branchesAPI.getAll(params);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const createBranch = createAsyncThunk('branches/create', async (data, thunkAPI) => {
  try {
    const res = await branchesAPI.create(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateBranchAsync = createAsyncThunk('branches/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await branchesAPI.update(id, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteBranchAsync = createAsyncThunk('branches/delete', async (id, thunkAPI) => {
  try {
    await branchesAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchContactChannels = createAsyncThunk('branches/fetchChannels', async (_, thunkAPI) => {
  try {
    return await contactChannelsAPI.getAll();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateContactChannelAsync = createAsyncThunk('branches/updateChannel', async ({ id, data }, thunkAPI) => {
  try {
    const res = await contactChannelsAPI.updateOne(id, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const branchesSlice = createSlice({
  name: 'branches',
  initialState: {
    items: [],
    channels: [],
    pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    loading: false,
    channelsLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBranches.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createBranch.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateBranchAsync.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBranchAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      })
      .addCase(fetchContactChannels.pending, (state) => { state.channelsLoading = true; })
      .addCase(fetchContactChannels.fulfilled, (state, action) => {
        state.channelsLoading = false;
        state.channels = action.payload.data;
      })
      .addCase(fetchContactChannels.rejected, (state, action) => {
        state.channelsLoading = false;
        state.error = action.payload;
      })
      .addCase(updateContactChannelAsync.fulfilled, (state, action) => {
        const idx = state.channels.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.channels[idx] = action.payload;
      });
  },
});

export default branchesSlice.reducer;
