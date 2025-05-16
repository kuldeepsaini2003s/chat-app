import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
  socket = io("http://localhost:8000/", {
    query: {
      userId,
    },
  });

  socket.on("connect", () => {});
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event, cb) => {
  if (socket) {
    socket.emit(event, cb);
  }
};

export const onEvent = (event, cb) => {
  if (socket) {
    socket.on(event, cb);
  }
};

export const offEvent = (event, cb) => {
  if (socket) {
    socket.off(event, cb);
  }
};
