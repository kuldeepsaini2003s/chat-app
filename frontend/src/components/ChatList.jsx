import { useDispatch, useSelector } from "react-redux";
import ChatItem from "./ChatItem";
import { setActiveChat } from "../redux/userSlice";
import { setMessages } from "../redux/messageSlice";

const ChatList = () => {
  const { activeChat, contacts } = useSelector((store) => store?.user);
  const dispatch = useDispatch();

  const handleClick = (chat) => {
    if (window.innerWidth < 748) {
      history.pushState({ chatOpen: true }, "");
    }
    dispatch(setMessages([]));
    dispatch(setActiveChat(chat));
    sessionStorage.setItem("activeChat", JSON.stringify(chat));
  };

  return (
    <div className="flex-1 p-2 rounded-md overflow-y-auto remove-scrollbar">
      <div className="flex flex-col gap-1">
        {contacts?.map((chat) => (
          <ChatItem
            key={chat?._id}
            chat={chat}
            isActive={activeChat?._id === chat?._id}
            onClick={() => handleClick(chat)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
