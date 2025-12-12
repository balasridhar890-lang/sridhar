/**
 * @format
 */

import plansReducer, {
  generatePlan,
  fetchTodayPlan,
  fetchPlanByDate,
  clearError,
  clearCurrentPlan,
} from '../src/store/plansSlice';

describe('plansSlice', () => {
  const initialState = {
    currentPlan: null,
    isLoading: false,
    isGenerating: false,
    error: null,
    lastFetched: null,
    hasPlanForToday: false,
  };

  it('should return the initial state', () => {
    expect(plansReducer(undefined, {})).toEqual(initialState);
  });

  describe('clearError', () => {
    it('should clear the error state', () => {
      const stateWithError = {
        ...initialState,
        error: 'Test error',
      };

      const newState = plansReducer(stateWithError, clearError());
      expect(newState.error).toBeNull();
    });
  });

  describe('clearCurrentPlan', () => {
    it('should clear the current plan state', () => {
      const stateWithPlan = {
        ...initialState,
        currentPlan: {
          id: 1,
          date: '2024-01-15',
          objectives: 'Test objectives',
          schedule: { items: [] },
        },
        hasPlanForToday: true,
        error: 'Some error',
      };

      const newState = plansReducer(stateWithPlan, clearCurrentPlan());
      expect(newState.currentPlan).toBeNull();
      expect(newState.hasPlanForToday).toBe(false);
      expect(newState.error).toBeNull();
    });
  });

  describe('generatePlan', () => {
    it('should handle generatePlan.pending', () => {
      const action = { type: generatePlan.pending.type };
      const state = plansReducer(initialState, action);

      expect(state.isGenerating).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle generatePlan.fulfilled', () => {
      const mockPlan = {
        id: 1,
        date: '2024-01-15',
        objectives: 'Test objectives',
        schedule: {
          items: [
            {
              time: '9:00 AM',
              activity: 'Morning routine',
              duration: '30 minutes',
            },
          ],
          summary: 'A productive day',
        },
      };

      const action = { type: generatePlan.fulfilled.type, payload: mockPlan };
      const state = plansReducer(initialState, action);

      expect(state.isGenerating).toBe(false);
      expect(state.currentPlan).toEqual(mockPlan);
      expect(state.hasPlanForToday).toBe(true);
      expect(state.error).toBeNull();
      expect(state.lastFetched).not.toBeNull();
    });

    it('should handle generatePlan.rejected', () => {
      const errorMessage = 'Failed to generate plan';
      const action = { type: generatePlan.rejected.type, payload: errorMessage };
      const state = plansReducer(initialState, action);

      expect(state.isGenerating).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.hasPlanForToday).toBe(false);
    });
  });

  describe('fetchTodayPlan', () => {
    it('should handle fetchTodayPlan.pending', () => {
      const action = { type: fetchTodayPlan.pending.type };
      const state = plansReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchTodayPlan.fulfilled', () => {
      const mockPlan = {
        id: 1,
        date: '2024-01-15',
        objectives: 'Test objectives',
        schedule: { items: [] },
      };

      const action = { type: fetchTodayPlan.fulfilled.type, payload: mockPlan };
      const state = plansReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.currentPlan).toEqual(mockPlan);
      expect(state.hasPlanForToday).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchTodayPlan.rejected with plan not found', () => {
      const errorMessage = 'No plan found for today';
      const action = { type: fetchTodayPlan.rejected.type, payload: errorMessage };
      const state = plansReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull(); // "No plan found" should not set error
      expect(state.hasPlanForToday).toBe(false);
    });

    it('should handle fetchTodayPlan.rejected with other errors', () => {
      const errorMessage = 'Network error';
      const action = { type: fetchTodayPlan.rejected.type, payload: errorMessage };
      const state = plansReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('fetchPlanByDate', () => {
    it('should handle fetchPlanByDate.pending', () => {
      const action = { type: fetchPlanByDate.pending.type };
      const state = plansReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchPlanByDate.fulfilled', () => {
      const mockPlan = {
        id: 1,
        date: '2024-01-16',
        objectives: 'Test objectives for specific date',
        schedule: { items: [] },
      };

      const action = { type: fetchPlanByDate.fulfilled.type, payload: mockPlan };
      const state = plansReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.currentPlan).toEqual(mockPlan);
      expect(state.error).toBeNull();
    });

    it('should handle fetchPlanByDate.rejected with plan not found', () => {
      const errorMessage = 'No plan found for date: 2024-01-16';
      const action = { type: fetchPlanByDate.rejected.type, payload: errorMessage };
      const state = plansReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull(); // "No plan found" should not set error
    });

    it('should handle fetchPlanByDate.rejected with other errors', () => {
      const errorMessage = 'Server error';
      const action = { type: fetchPlanByDate.rejected.type, payload: errorMessage };
      const state = plansReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('complex state transitions', () => {
    it('should handle complete plan generation workflow', () => {
      // Start with empty state
      let state = plansReducer(undefined, { type: 'INIT' });

      // Trigger plan generation
      state = plansReducer(state, { type: generatePlan.pending.type });
      expect(state.isGenerating).toBe(true);
      expect(state.error).toBeNull();

      // Complete plan generation
      const mockPlan = {
        id: 1,
        date: '2024-01-15',
        objectives: 'Complete project tasks\nExercise for 30 minutes\nRead for 1 hour',
        schedule: {
          items: [
            {
              time: '9:00 AM',
              activity: 'Morning standup meeting',
              duration: '30 minutes',
              notes: 'Team sync and daily planning'
            }
          ],
          summary: 'A balanced day focused on productivity, physical health, and personal growth'
        },
        created_at: '2024-01-15T08:00:00.000Z'
      };

      state = plansReducer(state, {
        type: generatePlan.fulfilled.type,
        payload: mockPlan
      });

      expect(state.isGenerating).toBe(false);
      expect(state.currentPlan).toEqual(mockPlan);
      expect(state.hasPlanForToday).toBe(true);

      // Clear current plan
      state = plansReducer(state, clearCurrentPlan());
      expect(state.currentPlan).toBeNull();
      expect(state.hasPlanForToday).toBe(false);
    });

    it('should handle fetching existing plan workflow', () => {
      // Start with empty state
      let state = plansReducer(undefined, { type: 'INIT' });

      // Trigger fetch plan
      state = plansReducer(state, { type: fetchTodayPlan.pending.type });
      expect(state.isLoading).toBe(true);

      // Complete fetch plan
      const mockPlan = {
        id: 1,
        date: '2024-01-15',
        objectives: 'Yesterday\'s objectives',
        schedule: {
          items: [
            {
              time: '10:00 AM',
              activity: 'Deep work session',
              duration: '2 hours'
            }
          ],
          summary: 'A productive day'
        }
      };

      state = plansReducer(state, {
        type: fetchTodayPlan.fulfilled.type,
        payload: mockPlan
      });

      expect(state.isLoading).toBe(false);
      expect(state.currentPlan).toEqual(mockPlan);
      expect(state.hasPlanForToday).toBe(true);

      // Clear error
      state = plansReducer(state, clearError());
      expect(state.error).toBeNull();
    });
  });
});