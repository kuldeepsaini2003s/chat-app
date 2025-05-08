import { useEffect, useRef, useState } from "react";
import ChatList from "./ChatList";
import { EllipsisVertical, RefreshCcw, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BACKEND_USER } from "../utils/constant";
import { useNavigate } from "react-router-dom";
import { setActiveChat, setContacts, setUser } from "../redux/userSlice";
import { toast } from "react-toastify";
import { setMessages } from "../redux/messageSlice";

const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const { user, activeChat, contacts } = useSelector((store) => store?.user);
  const [popUp, setPopUp] = useState(false);
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
          console.error("Error while searching user", error);
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
    try {
      const { data } = await axios.get(BACKEND_USER + "/logout", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (data?.success) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch(setUser(null));
        dispatch(setMessages(null));
        dispatch(setContacts(null));
        dispatch(setActiveChat(null));
        toast.success(data?.msg);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error while logging out", error);
      toast.error(error?.response?.data?.msg);
    }
  };

  return (
    <div
      className={`${
        activeChat ? "max-[748px]:hidden " : "flex-1"
      } min-w-[320px] min-[748px]:max-w-[350px] flex flex-col border-r border-gray-200 bg-white`}
    >
      <div className="p-3 relative bg-gray-100 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center ">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2">
            <img
              src={user?.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium">{user?.name}</span>
        </div>
        <div className="flex gap-4 text-gray-600">
          <button
            onClick={() => window.location.reload()}
            className="hover:text-gray-800 cursor-pointer"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            ref={popUpRef}
            onClick={() => setPopUp(!popUp)}
            className="hover:text-gray-800 cursor-pointer"
          >
            <EllipsisVertical size={18} />
            {popUp && (
              <div className="w-fit z-50 flex flex-col bg-white rounded-md shadow-2xl absolute right-0 -bottom-20">
                <button className="px-5 py-2 cursor-pointer hover:bg-[#d0fdc8]">
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 cursor-pointer hover:bg-[#d0fdc8]"
                >
                  Logout
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="p-2 relative">
        <div className="flex gap-2 items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-600" />
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
        <div className="text-center text-sm text-gray-500 p-4">
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
    <div className="absolute w-[95%] flex flex-col gap-2 bg-gray-100 rounded-md p-2 top-12 shadow-md">
      {searchResult?.length > 0 ? (
        searchResult?.map((result) => (
          <div
            onClick={() => handleSearchClick(result)}
            key={result?._id}
            className="flex text-start  gap-3"
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
        <div className="text-center text-sm text-gray-500">
          Hmm... looks like no one by that name is here yet.
        </div>
      )}
    </div>
  );
};
