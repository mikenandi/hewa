import { configureStore } from "@reduxjs/toolkit";
import { AppLocalStorage } from "@/costants/storage-keys";
import { writeJson } from "@/utils/storage";
import locationsSlice from "./reducers/locations-slice";
import settingsSlice from "./reducers/settings-slice";

export const store = configureStore({
  reducer: {
    settings: settingsSlice,
    locations: locationsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Persist user preferences and places so they survive restarts and are
// readable from the background task (src/tasks/weather-task.ts).
let previous = store.getState();
store.subscribe(() => {
  const next = store.getState();
  if (next.settings !== previous.settings)
    writeJson(AppLocalStorage.SETTINGS, next.settings);
  if (next.locations !== previous.locations)
    writeJson(AppLocalStorage.LOCATIONS, next.locations);
  previous = next;
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
