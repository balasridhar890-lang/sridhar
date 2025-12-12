import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../api/client';

// Async thunks
export const generatePlan = createAsyncThunk(
  'plans/generate',
  async ({date, userInput}, {rejectWithValue}) => {
    try {
      const payload = {};
      if (date) payload.date = date;
      if (userInput) payload.userInput = userInput;

      const response = await apiClient.post('/plans/generate', payload);
      return response.plan;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate plan');
    }
  }
);

export const fetchTodayPlan = createAsyncThunk(
  'plans/fetchToday',
  async (_, {rejectWithValue}) => {
    try {
      const response = await apiClient.get('/plans/today');
      return response.plan;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch today\'s plan');
    }
  }
);

export const fetchPlanByDate = createAsyncThunk(
  'plans/fetchByDate',
  async ({date}, {rejectWithValue}) => {
    try {
      const response = await apiClient.get(`/plans/${date}`);
      return response.plan;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch plan for ${date}`);
    }
  }
);

const initialState = {
  currentPlan: null,
  isLoading: false,
  isGenerating: false,
  error: null,
  lastFetched: null,
  hasPlanForToday: false,
};

export const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearCurrentPlan: state => {
      state.currentPlan = null;
      state.error = null;
      state.hasPlanForToday = false;
    },
  },
  extraReducers: builder => {
    // Generate Plan
    builder
      .addCase(generatePlan.pending, state => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generatePlan.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentPlan = action.payload;
        state.lastFetched = new Date().toISOString();
        state.hasPlanForToday = true;
        state.error = null;
      })
      .addCase(generatePlan.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
        state.hasPlanForToday = false;
      });

    // Fetch Today Plan
    builder
      .addCase(fetchTodayPlan.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPlan = action.payload;
        state.lastFetched = new Date().toISOString();
        state.hasPlanForToday = true;
        state.error = null;
      })
      .addCase(fetchTodayPlan.rejected, (state, action) => {
        state.isLoading = false;
        // Don't set error if it's just "no plan found" - treat as empty state
        if (action.payload?.includes('No plan found')) {
          state.error = null;
          state.hasPlanForToday = false;
        } else {
          state.error = action.payload;
        }
      });

    // Fetch Plan by Date
    builder
      .addCase(fetchPlanByDate.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlanByDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPlan = action.payload;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchPlanByDate.rejected, (state, action) => {
        state.isLoading = false;
        // Don't set error if it's just "no plan found" - treat as empty state
        if (action.payload?.includes('No plan found')) {
          state.error = null;
        } else {
          state.error = action.payload;
        }
      });
  },
});

export const {clearError, clearCurrentPlan} = plansSlice.actions;

export default plansSlice.reducer;