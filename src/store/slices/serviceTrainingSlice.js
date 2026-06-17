import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceTrainingAPI } from '../../services/api';

export const fetchServiceTraining = createAsyncThunk('serviceTraining/fetch', async (_, thunkAPI) => {
  try {
    const res = await serviceTrainingAPI.get();
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateServiceTraining = createAsyncThunk('serviceTraining/update', async (data, thunkAPI) => {
  try {
    const res = await serviceTrainingAPI.update(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const serviceTrainingSlice = createSlice({
  name: 'serviceTraining',
  initialState: {
    data: null,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceTraining.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceTraining.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchServiceTraining.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateServiceTraining.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateServiceTraining.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(updateServiceTraining.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export default serviceTrainingSlice.reducer;
