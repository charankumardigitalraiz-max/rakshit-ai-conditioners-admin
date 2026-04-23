import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoriesAPI } from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────
export const fetchCategories = createAsyncThunk('categories/fetchAll', async (params, thunkAPI) => {
    try {
        const res = await categoriesAPI.getAll(params);
        return res;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const createCategory = createAsyncThunk('categories/create', async (data, thunkAPI) => {
    try {
        const res = await categoriesAPI.create(data);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const deleteCategoryAsync = createAsyncThunk('categories/delete', async (id, thunkAPI) => {
    try {
        await categoriesAPI.delete(id);
        return id;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const updateCategoryAsync = createAsyncThunk('categories/update', async ({ id, data }, thunkAPI) => {
    try {
        const res = await categoriesAPI.update(id, data);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

// ─── Slice ───────────────────────────────────────────────────
const categorySlice = createSlice({
    name: 'categories',
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
            .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createCategory.fulfilled, (state, action) => { state.items.push(action.payload); })
            .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
                state.items = state.items.filter(c => c._id !== action.payload && c.id !== action.payload);
            })
            .addCase(updateCategoryAsync.fulfilled, (state, action) => {
                const index = state.items.findIndex(c => c._id === action.payload._id || c.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            });
    },
});

export default categorySlice.reducer;
