import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectsAPI } from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────
export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await projectsAPI.getAll(params);
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const createProject = createAsyncThunk('projects/create', async (data, thunkAPI) => {
  try {
    const res = await projectsAPI.create(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deleteProjectAsync = createAsyncThunk('projects/delete', async (id, thunkAPI) => {
  try {
    await projectsAPI.delete(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const updateProjectAsync = createAsyncThunk('projects/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await projectsAPI.update(id, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// ─── Slice ───────────────────────────────────────────────────
const projectsSlice = createSlice({
  name: 'projects',
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
  reducers: {
    addProject: (state, action) => { state.items.push(action.payload); },
    removeProject: (state, action) => { state.items = state.items.filter(p => p._id !== action.payload && p.id !== action.payload); },
    updateProject: (state, action) => {
      const index = state.items.findIndex(p => p._id === action.payload._id || p.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProjects.fulfilled, (state, action) => { 
        state.loading = false; 
        state.items = action.payload.data; 
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createProject.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload && p.id !== action.payload);
      });
  },
});

export const { addProject, removeProject, updateProject } = projectsSlice.actions;
export default projectsSlice.reducer;
