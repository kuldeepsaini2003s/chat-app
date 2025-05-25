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
    updateLastMessage: (state, action) => {
      const lastMessage = action.payload;
      const updateMessage = state.contacts.find(
        (chat) => chat.chatId === lastMessage.chatId
      );
      if (updateMessage) {
        updateMessage.lastMessage = lastMessage?.message;
        updateMessage.time = lastMessage?.time;
        updateMessage.status = lastMessage?.status;
        updateMessage.unSeen = lastMessage?.unSeen;
      }
    },
    updateLastSeen: (state, action) => {
      const { userId, lastSeen } = action.payload;
      const updateUser = state.contacts.find((user) => user?._id === userId);
      if (updateUser) {
        updateUser.lastSeen = lastSeen;
      }
    },
  },
});

export const {
  setUser,
  setContacts,
  setActiveChat,
  setOnlineUsers,
  updateLastMessage,
  updateLastSeen,
} = userSlice.actions;

export default userSlice.reducer;
