import "./App.css";
import useFetchContacts from "./hooks/useFetchContacts";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import LoginBlocker from "./hooks/LoginBlocker";
import ProtectiveRoute from "./hooks/ProtectiveRoute";
import { useEffect, useRef } from "react";
import {
  setActiveChat,
  setOnlineUsers,
  updateLastSeen,
} from "./redux/userSlice";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  onEvent,
} from "../socket/socket";
import ForgotPassword from "./components/ForgotPassword";
import useHandleMessages from "./hooks/useHandleMessages";
import useFetchUser from "./hooks/useFetchUser";
import Body from "./components/Body";
import { setImagePreview, setImageUrl } from "./redux/stateSlice";

function App() {
  useFetchUser();
  useFetchContacts();
  useHandleMessages();
  const { activeChat, user, contacts } = useSelector((store) => store?.user);
  const activeChatData = sessionStorage.getItem("activeChat");
  const dispatch = useDispatch();

  useEffect(() => {
    if (activeChatData) {
      if (window.innerWidth < 748) {
        const currentState = history?.state;
        if (!currentState.chatOpen) {
          history.pushState({ chatOpen: true }, "");
        }
      }
      dispatch(setActiveChat(JSON.parse(activeChatData)));
    }
  }, [activeChatData]);

  // Update activeChat lastSeen
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
    onEvent("LastSeenUpdate", (data) => {
      dispatch(updateLastSeen(data));
    });
    return () => {
      disconnectSocket();
    };
  }, [user?._id]);

  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state || {};

      if (!state.imagePreview) {
        dispatch(setImagePreview(false));
        dispatch(setImageUrl(null));
      }

      if (!state.chatOpen) {
        dispatch(setActiveChat(null));
        sessionStorage.removeItem("activeChat");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
