import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface SearchState {
  location: string;
  searchError: string;
}

const initialState: SearchState = {
  location: "",
  searchError: "",
};

const searchSlice = createSlice({
  name: "SEARCH_RESULTS_SLICE",
  initialState,
  reducers: {
    locationInputReducer: (state, actions: PayloadAction<string>) => {
      state.location = actions.payload;
    },
    searchErrorReducer: (state, actions: PayloadAction<string>) => {
      state.searchError = actions.payload;
    },
  },
});

export const { locationInputReducer, searchErrorReducer } = searchSlice.actions;

export default searchSlice.reducer;
