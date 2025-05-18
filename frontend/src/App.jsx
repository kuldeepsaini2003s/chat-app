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
import { useEffect, useRef } from "react";
import { BACKEND_USER } from "./utils/constant";
import axios from "axios";
import { setActiveChat, setOnlineUsers, setUser } from "./redux/userSlice";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  onEvent,
} from "../socket/socket";
import { updateMessageStatus } from "./redux/messageSlice";
import useResponseHandler from "./hooks/useResponseHandler";

function App() {
  const { handleError } = useResponseHandler();
  const { activeChat, user, contacts } = useSelector((store) => store?.user);
  const { messages } = useSelector((store) => store?.message);
  const token = localStorage.getItem("accessToken");
  const activeChatRef = useRef(activeChat);
  const dispatch = useDispatch();
  const activeChatData = sessionStorage.getItem("activeChat");

  useEffect(() => {
    if (activeChatData) {
      dispatch(setActiveChat(JSON.parse(activeChatData)));
    }
  }, []);

  useEffect(() => {
    if (token && !user) {
      const fetchUser = async () => {
        try {
          const { data } = await axios.get(BACKEND_USER + "/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (data?.success) {
            dispatch(setUser(data?.data));
          }
        } catch (error) {
          handleError({
            error,
            message: error?.response?.data?.msg,
          });
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
    if (contacts) {
      contacts?.find(
        (chat) =>
          chat?.chatId === activeChat?.chatId &&
          dispatch(setActiveChat({ ...activeChat, lastSeen: chat?.lastSeen }))
      );
    }
  }, [contacts]);

  // Call this on page load and resize
  function setRealViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  useEffect(() => {
    setRealViewportHeight();
    window.addEventListener("resize", setRealViewportHeight);
    return () => window.removeEventListener("resize", setRealViewportHeight);
  }, []);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const handlePopState = () => {
      if (activeChatRef.current) {
        dispatch(setActiveChat(null));
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectiveRoute />}>
          <Route
            path="/"
            element={
              <div className={`flex max-[748px]:flex-col h-svh bg-gray-100`}>
                <Sidebar />
                <div
                  className={`flex ${
                    !activeChat ? "max-[748px]:hidden" : ""
                  } w-full flex-col h-svh relative w-3/4`}
                >
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
