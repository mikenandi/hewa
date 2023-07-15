import { configureStore } from "@reduxjs/toolkit";
import modalSlice from "./modal-slice";
import searchSlice from "./search-slice";

export const store = configureStore({
  reducer: {
    modal: modalSlice,
    search: searchSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
