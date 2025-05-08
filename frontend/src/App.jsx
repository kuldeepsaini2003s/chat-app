import Sidebar from "./components/Sidebar";
import "./App.css";
import useFetchContacts from "./hooks/useFetchContacts";
import ChatContainer from "./components/ChatContainer";
import { useDispatch, useSelector } from "react-redux";
import WelcomeScreen from "./components/WelcomeScreen";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import LoginBlocker from "./hooks/LoginBlocker";
import ProtectiveRoute from "./hooks/ProtectiveRoute";
import { useEffect } from "react";
import { LOCAL_USER } from "./utils/constant";
import axios from "axios";
import {
  setActiveChat,
  setOnlineUsers,
  setUser,
  updateLastMessage,
} from "./redux/userSlice";
import {
  connectSocket,
  disconnectSocket,
  emitEvent,
  getSocket,
  onEvent,
} from "../socket/socket";
import { updateMessageStatus } from "./redux/messageSlice";

function App() {
  const { activeChat, user, contacts } = useSelector((store) => store.user);
  const { messages } = useSelector((store) => store.message);
  const token = localStorage.getItem("accessToken");
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && !user) {
      const fetchUser = async () => {
        const { data } = await axios.get(LOCAL_USER + "/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.success) {
          dispatch(setUser(data?.data));
        }
      };

      fetchUser();
    }
  }, []);

  useFetchContacts();

  const socket = getSocket();

  useEffect(() => {
    if (user) {
      connectSocket(user?._id);

      onEvent("getOnlineUser", (users) => {
        dispatch(setOnlineUsers(users));
      });

      return () => disconnectSocket();
    } else {
      if (socket) {
        disconnectSocket();
      }
    }
  }, [user]);

  useEffect(() => {
    onEvent("messageDelivered", (id) => {
      dispatch(updateMessageStatus({ id, status: "delivered" }));
    });
  }, [socket, messages]);

  useEffect(() => {
    if (activeChat && messages.length > 0) {
      const hasUnseenMessages = messages.some(
        (msg) =>
          msg.senderId === activeChat?._id &&
          msg.receiverId === user._id &&
          msg.status === "delivered"
      );

      if (hasUnseenMessages) {
        emitEvent("messageSeen", {
          senderId: activeChat?._id,
          receiverId: user?._id,
        });
      }

      onEvent("messageSeen", (id) => {
        dispatch(updateMessageStatus({ id, status: "seen" }));
      });

      emitEvent("lastMessage", {
        senderId: activeChat?._id,
        receiverId: user?._id,
      });

      onEvent("lastMessage", (lastMessage) => {
        if (lastMessage) {
          dispatch(updateLastMessage(lastMessage));
        }
        if (activeChat.chatId === lastMessage.chatId) {
          dispatch(setActiveChat({ ...activeChat, lastSeem: lastMessage }));
        }
      });
    }
  }, [activeChat, user, messages]);

  useEffect(() => {
    if (contacts) {
      contacts?.find(
        (chat) =>
          chat?.chatId === activeChat?.chatId &&
          dispatch(setActiveChat({ ...activeChat, lastSeen: chat?.lastSeen }))
      );
    }
  }, [contacts]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectiveRoute />}>
          <Route
            path="/"
            element={
              <div className="flex h-screen  bg-gray-100">
                <Sidebar />
                <div className="flex w-full flex-col relative w-3/4">
                  {activeChat ? <ChatContainer /> : <WelcomeScreen />}
                </div>
              </div>
            }
          />
        </Route>
        <Route element={<LoginBlocker />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/forgot-password" element={<Login />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
