import { configureStore } from "@reduxjs/toolkit";
import stateSlice from "./stateSlice";
import messageSlice from "./messageSlice";
import userSlice from "./userSlice";
import socketSlice from "./socketSlice";

const store = configureStore({
  reducer: {
    state: stateSlice,
    message: messageSlice,
    user: userSlice,
    socket: socketSlice,
  },
});

export default store;