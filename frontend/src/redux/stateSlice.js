import { createSlice } from "@reduxjs/toolkit";

const stateSlice = createSlice({
  name: "state",
  initialState: {
    mediaPreview: false,
    mediaFiles: [],
    confirmationPop: false,
  },
  reducers: {
    setMediaPreview: (state, action) => {
      state.mediaPreview = action.payload;
    },
    setMediaFiles: (state, action) => {
      state.mediaFiles = action.payload;
    },
    setConfirmationPop: (state, action) => {
      state.confirmationPop = action.payload;
    },
  },
});

export const { setMediaFiles, setMediaPreview, setConfirmationPop } =
  stateSlice.actions;

export default stateSlice.reducer;
