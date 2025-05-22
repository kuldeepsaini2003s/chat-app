import { ArrowLeft, Phone, Search, Video } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getLastSeen } from "../utils/constant";
import { useEffect, useState } from "react";
import { setActiveChat } from "../redux/userSlice";

const ChatHeader = () => {
  const { activeChat, onlineUsers, contacts } = useSelector(
    (store) => store?.user
  );
  const [lastSeem, setLastSeen] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const isOnline = onlineUsers?.includes(activeChat?._id)
      ? "Online"
      : activeChat?.lastSeen
      ? `${getLastSeen(activeChat?.lastSeen)}`
      : "Offline";

    setLastSeen(isOnline);
  }, [onlineUsers, activeChat, contacts]);

  const closeChat = () => {
    history.replaceState({}, "");
    dispatch(setActiveChat(null));
    sessionStorage.removeItem("activeChat");
  };

  return (
    <div className="p-2 flex justify-between items-center border-b border-lightGray dark:border-lightBlack">
      <div className="flex items-center gap-3">
        <button
          onClick={closeChat}
          className="cursor-pointer p-2 rounded-full hover:bg-lightGray dark:hover:bg-lightBlack"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
          <img
            src={activeChat?.avatar}
            alt={activeChat?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="font-medium">{activeChat?.name}</div>
          <div className="text-xs  dark:text-darkText">{lastSeem}</div>
        </div>
      </div>
      <div className="flex gap-4">
        <button className="p-2 rounded-full hover:bg-lightGray dark:hover:bg-lightBlack">
          <Phone size={18} />
        </button>
        <button className="p-2 rounded-full hover:bg-lightGray dark:hover:bg-lightBlack">
          <Video size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-lightGray dark:hover:bg-lightBlack">
          <Search size={17} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
