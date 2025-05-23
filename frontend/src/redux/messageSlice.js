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

export const { setMessages, updateMessageStatus, appendMessage } =
  messageSlice.actions;

export default messageSlice.reducer;
