import { createSlice } from "@reduxjs/toolkit";

const stateSlice = createSlice({
  name: "state",
  initialState: {
    mediaPreview: false,
    mediaFiles: [],
    confirmationPop: false,
    imagePreview: false,
    imageUrl: null,
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
    setImagePreview: (state, action) => {
      state.imagePreview = action.payload;
    },
    setImageUrl: (state, action) => {
      state.imageUrl = action.payload;
    },
  },
});

export const {
  setMediaFiles,
  setMediaPreview,
  setConfirmationPop,
  setImagePreview,
  setImageUrl,
} = stateSlice.actions;

export default stateSlice.reducer;
