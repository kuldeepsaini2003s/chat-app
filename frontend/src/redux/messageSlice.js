import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    media: [],
    voice: null,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    updateMessageByTempId: (state, action) => {
      const { tempId, newMessage } = action.payload;
      const index = state.messages.findIndex((msg) => msg._id === tempId);
      if (index !== -1) {
        state.messages[index] = newMessage;
      }
    },
    appendMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action) => {
      const { id, status } = action.payload;
      const msg = state.messages.find((m) => m._id === id);
      if (msg && msg.status !== status) {
        msg.status = status;
      }
    },
  },
});

export const {
  setMessages,
  updateMessageStatus,
  appendMessage,
  updateMessageByTempId,
} = messageSlice.actions;

export default messageSlice.reducer;
