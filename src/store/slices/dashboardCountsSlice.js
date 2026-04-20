import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

export const fetchCounts = createAsyncThunk('dashboard/fetchCounts', async (_, thunkAPI) => {
    try {
        const response = await dashboardAPI.getCounts();
        return response.count;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

const dashboardCountsSlice = createSlice({
    name: 'dashboardCounts',
    initialState: {
        counts: {
            productsCount: 0,
            achievedCount: 0,
            projectsCount: 0,
            enquiriesCount: 0,
            contactsCount: 0,
            activities: [],
            trends: { products: 0, projects: 0, enquiries: 0, contacts: 0 }
        },
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCounts.fulfilled, (state, action) => {
                state.loading = false;
                state.counts = action.payload;
            })
            .addCase(fetchCounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default dashboardCountsSlice.reducer;

