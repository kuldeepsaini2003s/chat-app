import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    contacts: null,
    // activeChat: {
    //   _id: "6808f01220321d0731fa7d22",
    //   name: "ajay",
    //   avatar:
    //     "https://res.cloudinary.com/dbmszmntv/image/upload/v1745416209/chat_app/Chat_App_2025-04-23T13-50-06-030Z.jpg",
    //   lastSeen: "2025-05-08T03:57:21.801Z",
    //   lastMessage: "kaise ho ",
    //   status: "seen",
    //   time: "2025-05-01T06:52:27.372Z",
    //   chatId: "680a57799ae9813f7aca6b2b",
    // },
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
        updateMessage.lastMessage = lastMessage.message;
        updateMessage.time = lastMessage.time;
        updateMessage.status = lastMessage.status;
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
} = userSlice.actions;

export default userSlice.reducer;
