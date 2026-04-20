import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { achievementsAPI } from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────
export const fetchAchievements = createAsyncThunk('achievements/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await achievementsAPI.getAll();
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const createAchievement = createAsyncThunk('achievements/create', async (data, thunkAPI) => {
  try {
    const res = await achievementsAPI.create(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteAchievementAsync = createAsyncThunk('achievements/delete', async (id, thunkAPI) => {
  try {
    await achievementsAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateAchievementAsync = createAsyncThunk('achievements/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await achievementsAPI.update(id, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// ─── Slice ───────────────────────────────────────────────────
const achievementsSlice = createSlice({
  name: 'achievements',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    addAchievement: (state, action) => { state.items.push(action.payload); },
    removeAchievement: (state, action) => { state.items = state.items.filter(a => a._id !== action.payload && a.id !== action.payload); },
    updateAchievement: (state, action) => {
      const index = state.items.findIndex(a => a._id === action.payload._id || a.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAchievements.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAchievements.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchAchievements.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createAchievement.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(deleteAchievementAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a._id !== action.payload && a.id !== action.payload);
      });
  },
});

export const { addAchievement, removeAchievement, updateAchievement } = achievementsSlice.actions;
export default achievementsSlice.reducer;
