import { configureStore } from '@reduxjs/toolkit';
import employeesReducer from './slices/employeesSlice';
import recentLogsReducer from './slices/recentLogsSlice';
import employeeDetailsReducer from './slices/employeeDetailsSlice';
import departmentStatsReducer from './slices/departmentStatsSlice';

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    recentLogs: recentLogsReducer,
    employeeDetails: employeeDetailsReducer,
    departmentStats: departmentStatsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;