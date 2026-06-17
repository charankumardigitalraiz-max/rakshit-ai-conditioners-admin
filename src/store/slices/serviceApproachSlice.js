import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceApproachAPI } from '../../services/api';

export const fetchServiceApproach = createAsyncThunk('serviceApproach/fetch', async (_, thunkAPI) => {
  try {
    const res = await serviceApproachAPI.get();
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateServiceApproach = createAsyncThunk('serviceApproach/update', async (data, thunkAPI) => {
  try {
    const res = await serviceApproachAPI.update(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const serviceApproachSlice = createSlice({
  name: 'serviceApproach',
  initialState: {
    data: null,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceApproach.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceApproach.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchServiceApproach.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateServiceApproach.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateServiceApproach.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(updateServiceApproach.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export default serviceApproachSlice.reducer;
