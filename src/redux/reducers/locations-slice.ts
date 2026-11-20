import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { Place } from "@/api/geocoding";
import { AppLocalStorage } from "@/costants/storage-keys";
import { readJson } from "@/utils/storage";

export interface LocationsState {
  // Last known device location (null until permission is granted and a fix is found).
  current: Place | null;
  saved: Place[];
}

const emptyState: LocationsState = { current: null, saved: [] };

// Persisted by the store subscriber in src/redux/redux.ts.
const initialState: LocationsState = {
  ...emptyState,
  ...readJson<Partial<LocationsState>>(AppLocalStorage.LOCATIONS, {}),
};

const locationsSlice = createSlice({
  name: "LOCATIONS_SLICE",
  initialState,
  reducers: {
    currentLocationReducer: (state, action: PayloadAction<Place>) => {
      state.current = action.payload;
    },
    savePlaceReducer: (state, action: PayloadAction<Place>) => {
      if (!state.saved.some((place) => place.id === action.payload.id)) {
        state.saved.push(action.payload);
      }
    },
    removePlaceReducer: (state, action: PayloadAction<string>) => {
      state.saved = state.saved.filter((place) => place.id !== action.payload);
    },
  },
});

export const { currentLocationReducer, savePlaceReducer, removePlaceReducer } =
  locationsSlice.actions;

export default locationsSlice.reducer;
