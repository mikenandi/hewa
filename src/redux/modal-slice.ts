import { createSlice } from "@reduxjs/toolkit";

interface ModalState {
  searchResultsVisible: boolean;
}

const initialState: ModalState = {
  searchResultsVisible: false,
};

const modalSlice = createSlice({
  name: "MODAL_SLICE",
  initialState,
  reducers: {
    searchVisibleReducer: (state) => {
      state.searchResultsVisible = !state.searchResultsVisible;
    },
  },
});

export const { searchVisibleReducer } = modalSlice.actions;

export default modalSlice.reducer;
