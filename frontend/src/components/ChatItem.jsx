import { Check, CheckCheck, File, Image } from "lucide-react";
import { formatTime } from "../utils/constant";

const ChatItem = ({ chat, isActive, onClick }) => {
  return (
    <div
      className={`flex p-2 rounded-xl border-gray-100 cursor-pointer transition-colors ${
        isActive
          ? "bg-lightGray dark:bg-lightBlack"
          : "hover:bg-lightGray dark:hover:bg-lightBlack"
      }`}
      onClick={onClick}
    >
      <div className="w-12 h-12  rounded-full bg-gray-300 mr-3 overflow-hidden flex-shrink-0">
        <img
          src={chat?.avatar}
          alt={chat?.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="font-medium truncate">{chat?.name}</span>
          <span
            className={`${
              chat?.unSeen > 0
                ? "text-green-500"
                : " dark:text-darkText dark:text-[#ABACAC]"
            } text-xs flex-shrink-0 font-medium`}
          >
            {formatTime(chat?.time)}
          </span>
        </div>
        <div className="text-sm  flex justify-between items-center gap-1.5">
          <p className="flex items-center gap-1">
            <span>
              <>
                {chat?.status === "sent" && <Check color="#6a7282" size={14} />}
                {chat?.status === "delivered" && (
                  <CheckCheck color="#6a7282" size={14} />
                )}
                {chat?.status === "seen" && (
                  <CheckCheck
                    size={14}
                    className="text-blue dark:text-darkBlue"
                  />
                )}
              </>
            </span>
            <span className="flex items-center gap-1  dark:text-darkText line-clamp-1">
              {chat?.type === "image" ? (
                <>
                  {" "}
                  <Image size={14} /> Image
                </>
              ) : chat?.type === "file" ? (
                <>
                  <File className="flex-shrink-0" size={14} />{" "}
                  <span className="line-clamp-1">{chat?.fileName}</span>
                </>
              ) : (
                <span className="line-clamp-1">{chat?.lastMessage}</span>
              )}
            </span>
          </p>
          {chat?.unSeen > 0 && (
            <p className="rounded-full text-[10px] flex items-center justify-center bg-green-500 text-white w-4 h-4">
              {chat?.unSeen}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
