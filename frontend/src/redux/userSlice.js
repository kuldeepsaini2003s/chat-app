import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    contacts: null,
    activeChat: null,
    onlineUsers: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setContacts: (state, action) => {
      state.contacts = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setUser, setContacts, setActiveChat, setOnlineUsers } =
  userSlice.actions;

export default userSlice.reducer;
