import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

// Get user from local storage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const initialState = {
  user: user ? user : null,
  token: token ? token : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Login user
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const data = await authAPI.login(userData);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get Me (fetch user details)
export const getMe = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const response = await authAPI.getMe();
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    return thunkAPI.rejectWithValue('Token verification failed');
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Update User Details
export const updateUserDetails = createAsyncThunk('auth/updateDetails', async (userData, thunkAPI) => {
  try {
    const response = await authAPI.updateDetails(userData);
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    return thunkAPI.rejectWithValue('Update failed');
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Update User Password
export const updateUserPassword = createAsyncThunk('auth/updatePassword', async (passwords, thunkAPI) => {
  try {
    const response = await authAPI.updatePassword(passwords);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      return response;
    }
    return thunkAPI.rejectWithValue('Password update failed');
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      // Update User Details
      .addCase(updateUserDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update User Password
      .addCase(updateUserPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.token = action.payload.token;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isSuccess = false;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
