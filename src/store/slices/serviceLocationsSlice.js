import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceLocationsAPI } from '../../services/api';

export const fetchServiceLocations = createAsyncThunk('serviceLocations/fetchAll', async (params, thunkAPI) => {
  try {
    return await serviceLocationsAPI.getAll(params);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const createServiceLocation = createAsyncThunk('serviceLocations/create', async (data, thunkAPI) => {
  try {
    const res = await serviceLocationsAPI.create(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateServiceLocationAsync = createAsyncThunk('serviceLocations/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await serviceLocationsAPI.update(id, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteServiceLocationAsync = createAsyncThunk('serviceLocations/delete', async (id, thunkAPI) => {
  try {
    await serviceLocationsAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const serviceLocationsSlice = createSlice({
  name: 'serviceLocations',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceLocations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchServiceLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchServiceLocations.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createServiceLocation.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateServiceLocationAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteServiceLocationAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default serviceLocationsSlice.reducer;
