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
import ForgotPassword from "./components/ForgotPassword";
import { setImagePreview, setImageUrl } from "./redux/stateSlice";
import { ArrowLeft, Download } from "lucide-react";

function App() {
  const { handleError } = useResponseHandler();
  const { activeChat, user, contacts } = useSelector((store) => store?.user);
  const { messages } = useSelector((store) => store?.message);
  const token = localStorage.getItem("accessToken");
  const activeChatRef = useRef(activeChat);
  const dispatch = useDispatch();
  const activeChatData = sessionStorage.getItem("activeChat");
  const { imageUrl, imagePreview } = useSelector((store) => store?.state);
  const imagePreviewRef = useRef(null);

  useEffect(() => {
    if (activeChatData) {
      dispatch(setActiveChat(JSON.parse(activeChatData)));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest(".button-container")) return;

      if (
        imagePreviewRef?.current &&
        !imagePreviewRef?.current.contains(e.target)
      ) {
        dispatch(setImagePreview(false));
        dispatch(setImageUrl(null));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const handlePopState = () => {
      if (activeChatRef.current) {
        dispatch(setActiveChat(null));
      }
      if (imagePreview && imageUrl) {
        dispatch(setImagePreview(false));
        dispatch(setImageUrl(null));
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleDownload = (url, filename) => {
    // insert fl_attachment into the Cloudinary URL to download file
    const downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                {imagePreview && (
                  <div className="absolute p-2 max-ml:p-1 flex flex-col  gap-2 text-white inset-0 z-50 w-full h-ful bg-black/70 backdrop-blur-lg backdrop-saturate-150">
                    <div className="button-container max-ml:text-sm flex items-center gap-3 w-full">
                      <button
                        onClick={() => {
                          dispatch(setImagePreview(false));
                          dispatch(setImageUrl(null));
                        }}
                        className="cursor-pointer p-1 rounded-full hover:bg-[#303030]"
                      >
                        <ArrowLeft className="w-10 max-ml:w-5" />
                      </button>
                      <h1 className="w-full">{imageUrl?.name}</h1>
                      <button
                        onClick={() => {
                          handleDownload(imageUrl?.url, imageUrl?.name);
                        }}
                        className="cursor-pointer"
                      >
                        <Download className="w-10 max-ml:w-5" />
                      </button>
                    </div>
                    <div className="w-full h-[90%] flex justify-center items-center rounded-md">
                      <img
                        src={imageUrl?.url}
                        ref={imagePreviewRef}
                        className="object-contain min-w-48 max-w-[90%] max-ml:max-w-full max-h-[100%] rounded-md"
                        alt=""
                      />
                    </div>
                  </div>
                )}
              </div>
            }
          />
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
