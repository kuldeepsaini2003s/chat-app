import { useEffect, useRef, useState } from "react";
import ChatList from "./ChatList";
import {
  EllipsisVertical,
  LogOut,
  RefreshCcw,
  Search,
  SunMoon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BACKEND_USER } from "../utils/constant";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { setActiveChat, setContacts, setUser } from "../redux/userSlice";
import { toast } from "react-toastify";
import { setMessages } from "../redux/messageSlice";
import useResponseHandler from "../hooks/useResponseHandler";

const Sidebar = () => {
  const { handleResponse, handleError } = useResponseHandler();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const { user, activeChat, contacts } = useSelector((store) => store?.user);
  const [popUp, setPopUp] = useState(false);
  const [theme, setTheme] = useState("");
  const popUpRef = useRef(null);

  useEffect(() => {
    const handleOutSideClick = (e) => {
      if (popUpRef.current && !popUpRef.current.contains(e.target)) {
        setPopUp(false);
      }
    };
    document.addEventListener("mousedown", handleOutSideClick);
    return () => document.removeEventListener("mousedown", handleOutSideClick);
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.body.classList.add("className", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.classList.remove(theme);
    document.body.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    setPopUp(false);
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const fetchUser = async () => {
        try {
          const { data } = await axios.get(
            `${BACKEND_USER}/search?query=${searchQuery}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          if (data?.success) {
            setSearchResult(data?.data);
          }
        } catch (error) {
          handleError({
            error,
            message: error?.response?.data?.msg,
          });
          setSearchResult([]);
        }
      };
      if (searchQuery) {
        fetchUser();
      }
    }
  }, [searchQuery]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const toastId = toast.loading("logging out...");
    try {
      const { status, data } = await axios.get(BACKEND_USER + "/logout", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      handleResponse({
        status: status,
        message: data.msg,
        toastId,
        showToast: true,
        onSuccess: () => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch(setUser(null));
          dispatch(setMessages(null));
          dispatch(setContacts(null));
          dispatch(setActiveChat(null));
          navigate("/login");
        },
      });
    } catch (error) {
      handleError({
        error,
        toastId,
        showToast: true,
        message: error?.response?.data?.msg || "Failed to logout.",
      });
    }
  };

  return (
    <div
      className={`${
        activeChat ? "max-[748px]:hidden " : "flex-1"
      } min-w-[320px] min-[748px]:max-w-[350px] flex flex-col border-r border-lightGray dark:border-lightBlack`}
    >
      <div className="p-2 relative flex justify-between items-center border-b border-lightGray dark:border-lightBlack">
        <div className="flex items-center ">
          <div className="w-10 h-10 rounded-full  flex items-center justify-center overflow-hidden mr-2">
            <img
              src={user?.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium">{user?.name}</span>
        </div>
        <div className="flex gap-4 ">
          <button
            onClick={() => window.location.reload()}
            className="hover:bg-lightGray dark:hover:bg-darkBlack p-2 rounded-full cursor-pointer"
          >
            <RefreshCcw size={16} />
          </button>
          <button
            ref={popUpRef}
            onClick={() => setPopUp(!popUp)}
            className="hover:bg-lightGray dark:hover:bg-darkBlack p-2 rounded-full cursor-pointer"
          >
            <EllipsisVertical size={16} />
            {popUp && (
              <div className="w-fit z-50 flex flex-col bg-white dark:text-white dark:bg-[#1D1F1F] text-sm rounded-md shadow-2xl absolute -right-20 z-50 -bottom-26">
                <button className="px-4 flex items-center gap-4 rounded-t-md py-2 cursor-pointer hover:bg-lightGray dark:hover:bg-[#343636]">
                  <CgProfile size={20} /> Profile
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-4 px-4 py-2 cursor-pointer hover:bg-lightGray dark:hover:bg-[#343636]"
                >
                  <SunMoon size={20} /> Dark Theme
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-4 py-2 cursor-pointer rounded-b-md hover:bg-lightGray dark:hover:bg-[#343636]"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="p-2 relative">
        <div className="flex gap-2 items-center bg-lightGray dark:bg-lightBlack rounded-full px-3 py-2">
          <Search size={18} className="" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent outline-none flex-1 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery.trim() && (
          <SearchResultPop
            searchResult={searchResult}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </div>
      {contacts?.length > 0 ? (
        <ChatList />
      ) : (
        <div className="text-center text-sm  dark:text-darkText p-4">
          You don’t have any chats yet. Use the search bar above to start a new
          conversation.
        </div>
      )}
    </div>
  );
};

export default Sidebar;

export const SearchResultPop = ({
  searchResult,
  setSearchQuery,
  searchQuery,
}) => {
  const HighlightText = ({ text, search }) => {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts?.map((part, index) =>
          part?.toLowerCase() === search?.toLowerCase() ? (
            <span key={index} className="text-[#19a54d] h-fit font-bold">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };
  const dispatch = useDispatch();
  const handleSearchClick = (chat) => {
    dispatch(setActiveChat(chat));
    setSearchQuery("");
  };

  return (
    <div className="absolute w-[95%] bg-lightGray dark:bg-lightBlack flex flex-col gap-2  rounded-xl top-12 shadow-md">
      {searchResult?.length > 0 ? (
        searchResult?.map((result, index) => (
          <div
            onClick={() => handleSearchClick(result)}
            key={result?._id}
            className={`
              flex text-start hover:bg-white dark:hover:bg-darkBlack p-2 gap-3 
              ${index === 0 ? "rounded-t-xl" : ""} 
              ${index === searchResult.length - 1 ? "rounded-b-xl" : ""}
            `}
          >
            <img
              className="w-12 h-12 object-cover rounded-full "
              src={result?.avatar}
              alt={result?.name}
            />
            <h1>
              <HighlightText text={result?.name} search={searchQuery} />
            </h1>
          </div>
        ))
      ) : (
        <div className="text-center text-sm  dark:text-darkText">
          Hmm... looks like no one by that name is here yet.
        </div>
      )}
    </div>
  );
};
