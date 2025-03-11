import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import projectReducer from './features/projects/projectSlice';
import styleReducer from './features/styles/styleSlice';
import aiReducer from './features/ai/aiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    styles: styleReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;