import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import plansReducer from './plansSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: plansReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});
