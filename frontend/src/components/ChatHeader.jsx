import { Phone, Search, Video } from "lucide-react";
import { useSelector } from "react-redux";

const ChatHeader = () => {
  const { activeChat, onlineUsers } = useSelector((store) => store.user);
  const isOnline = onlineUsers.includes(activeChat._id) ? "Online" : "Offline";
  return (
    <div className="p-3 bg-gray-100 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 overflow-hidden">
          <img
            src={activeChat.avatar}
            alt={activeChat.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="font-medium">{activeChat.name}</div>
          <div className="text-xs text-gray-500">{isOnline}</div>
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
