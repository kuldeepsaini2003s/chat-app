import "./App.css";
import useFetchContacts from "./hooks/useFetchContacts";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import LoginBlocker from "./hooks/LoginBlocker";
import ProtectiveRoute from "./hooks/ProtectiveRoute";
import { useEffect, useRef } from "react";
import { setActiveChat, setOnlineUsers } from "./redux/userSlice";
import { connectSocket, disconnectSocket, onEvent } from "../socket/socket";
import ForgotPassword from "./components/ForgotPassword";
import useHandleMessages from "./hooks/useHandleMessages";
import useFetchUser from "./hooks/useFetchUser";
import Body from "./components/Body";

function App() {
  useFetchUser();
  useFetchContacts();
  useHandleMessages();
  const { activeChat, user, contacts } = useSelector((store) => store?.user);
  const activeChatData = sessionStorage.getItem("activeChat");
  const activeChatRef = useRef(activeChat);
  const dispatch = useDispatch();

  useEffect(() => {
    if (activeChatData) {
      dispatch(setActiveChat(JSON.parse(activeChatData)));
    }
  }, []);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Check if user is online or not
  useEffect(() => {
    if (contacts) {
      contacts?.find(
        (chat) =>
          chat?.chatId === activeChat?.chatId &&
          dispatch(setActiveChat({ ...activeChat, lastSeen: chat?.lastSeen }))
      );
    }
  }, [contacts]);

  // socket connection
  useEffect(() => {
    if (!user) return;

    connectSocket(user?._id);

    onEvent("getOnlineUser", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => {
      disconnectSocket();
    };
  }, [user?._id]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectiveRoute />}>
          <Route path="/" element={<Body />} />
        </Route>
        <Route element={<LoginBlocker />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
