import { configureStore } from '@reduxjs/toolkit';

// Create a simple initial store with no reducers yet
export const store = configureStore({
  reducer: {
    // Will add reducers here as we develop the app
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;