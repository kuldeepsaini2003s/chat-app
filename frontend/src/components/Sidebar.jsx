import { useEffect, useRef, useState } from "react";
import ChatList from "./ChatList";
import { EllipsisVertical, RefreshCcw, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { LOCAL_USER } from "../utils/constant";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";

const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSelector((store) => store.user);
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

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(LOCAL_USER + "/logout", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (data.success) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch(setUser(null));
        navigate("/login");
      }
    } catch (error) {
      console.error("Error while logging out", error);
    }
  };

  return (
    <div className="min-w-[300px] max-w-[300px] flex flex-col border-r border-gray-200 bg-white">
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
              <div className="w-fit flex flex-col bg-white rounded-md shadow-2xl absolute right-0 -bottom-20">
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

      <div className="p-2">
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
      </div>

      <ChatList />
    </div>
  );
};

export default Sidebar;
