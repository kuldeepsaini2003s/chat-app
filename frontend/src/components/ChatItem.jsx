import { Check, CheckCheck } from "lucide-react";
import { formatTime } from "../utils/constant";

const ChatItem = ({ chat, isActive, onClick }) => {
  return (
    <div
      className={`flex p-2 rounded-md border-gray-100 cursor-pointer transition-colors ${
        isActive ? "bg-gray-100" : "hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 overflow-hidden flex-shrink-0">
        <img
          src={chat?.avatar}
          alt={chat?.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="font-medium truncate">{chat?.name}</span>
        </div>
        <div className="flex justify-between items-center gap-1.5">
          <p className="text-sm flex items-center gap-1">
            <span>
              <>
                {chat?.status === "sent" && <Check color="#6a7282" size={14} />}
                {chat?.status === "delivered" && (
                  <CheckCheck color="#6a7282" size={14} />
                )}
                {chat?.status === "seen" && (
                  <CheckCheck size={14} color="#4FB4E0" />
                )}
              </>
            </span>
            <span className="text-gray-500 line-clamp-1">
              {chat?.lastMessage}
            </span>
          </p>
          <p className="text-xs flex-shrink-0 text-gray-500 font-medium">
            {formatTime(chat?.time)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
