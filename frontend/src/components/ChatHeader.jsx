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
      : `${getLastSeen(activeChat?.lastSeen)}`;
    setLastSeen(isOnline);
  }, [onlineUsers, activeChat, contacts]);

  return (
    <div className="p-3 bg-gray-100 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button onClick={() => dispatch(setActiveChat(null))}>
          <ArrowLeft
            size={18}
            className="cursor-pointer text-gray-600 hover:text-gray-800"
          />
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
          <div className="text-xs text-gray-500">{lastSeem}</div>
        </div>
      </div>
      <div className="flex gap-4 text-gray-600">
        <button className="hover:text-gray-800">
          <Phone size={20} />
        </button>
        <button className="hover:text-gray-800">
          <Video size={22} />
        </button>
        <button className="hover:text-gray-800">
          <Search size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
