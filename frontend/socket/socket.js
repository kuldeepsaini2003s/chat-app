import { io } from "socket.io-client";
import { BACKEND_SOCKET } from "../src/utils/constant";

let socketInstance = null;
export const connectSocket = (userId) => {
  if (socketInstance) return;

  if (!socketInstance) {
    socketInstance = io(BACKEND_SOCKET, {
      query: {
        userId,
      },
    });
  }

  socketInstance.on("connect", () => {
    // console.log("user connected");
  });
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const emitEvent = (event, cb) => {
  if (socketInstance) {
    socketInstance.emit(event, cb);
  }
};

export const onEvent = (event, cb) => {
  if (socketInstance) {
    socketInstance.on(event, cb);
  }
};

export const offEvent = (event, cb) => {
  if (socketInstance) {
    socketInstance.off(event, cb);
  }
};
