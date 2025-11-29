import { configureStore } from '@reduxjs/toolkit';
import employeesReducer from './slices/employeesSlice';
import recentLogsReducer from './slices/recentLogsSlice';
import employeeDetailsReducer from './slices/employeeDetailsSlice';
import departmentStatsReducer from './slices/departmentStatsSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    recentLogs: recentLogsReducer,
    employeeDetails: employeeDetailsReducer,
    departmentStats: departmentStatsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
    serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/initializeAuth/fulfilled'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;