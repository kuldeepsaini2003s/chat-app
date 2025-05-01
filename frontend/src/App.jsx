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
import { BACKEND_USER } from "./utils/constant";
import axios from "axios";
import { setOnlineUsers, setUser } from "./redux/userSlice";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  onEvent,
} from "../socket/socket";
import { setMessages } from "./redux/messageSlice";

function App() {
  const { activeChat, user } = useSelector((store) => store.user);
  const { messages } = useSelector((store) => store.message);
  const token = localStorage.getItem("accessToken");
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && !user) {
      const fetchUser = async () => {
        const { data } = await axios.get(BACKEND_USER + "/", {
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
      console.log("new Message Id:", id);
      const updateMessage = messages?.map((msg) =>
        msg._id === id ? { ...msg, status: "delivered" } : msg
      );
      dispatch(setMessages(updateMessage));
    });
  }, [socket, messages]);

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
