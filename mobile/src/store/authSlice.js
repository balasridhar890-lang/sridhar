import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../api/client';
import {storage} from '../utils/storage';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({email, password}, {rejectWithValue}) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      const {token, user} = response;
      
      // Store token and user data
      await storage.saveToken(token);
      await storage.saveUser(user);
      
      return {token, user};
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({email, password, name}, {rejectWithValue}) => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name,
      });
      
      const {token, user} = response;
      
      // Store token and user data
      await storage.saveToken(token);
      await storage.saveUser(user);
      
      return {token, user};
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, {rejectWithValue}) => {
    try {
      const token = await storage.getToken();
      const user = await storage.getUser();
      
      if (token && user) {
        return {token, user};
      }
      
      return rejectWithValue('No stored auth data');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load stored auth');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, {rejectWithValue}) => {
    try {
      await storage.clearAll();
      return {};
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  isLoadingAuth: true,
  error: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    resetAuth: state => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
    
    // Register
    builder
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
    
    // Load stored auth
    builder
      .addCase(loadStoredAuth.pending, state => {
        state.isLoadingAuth = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoadingAuth = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.isLoadingAuth = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
    
    // Logout
    builder
      .addCase(logoutUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {clearError, resetAuth} = authSlice.actions;

export default authSlice.reducer;