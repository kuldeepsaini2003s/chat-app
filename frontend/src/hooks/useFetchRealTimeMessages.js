import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/messageSlice";
import { getSocket, onEvent } from "../../socket/socket";

const useFetchRealTimeMessages = () => {
  const { messages } = useSelector((store) => store?.message);
  const { activeChat } = useSelector((store) => store?.user);
  const dispatch = useDispatch();
  const socket = getSocket();

  useEffect(() => {
    onEvent("newMessage", (newMessage) => {      
      if (activeChat?.chatId === newMessage?.chatId) {
        dispatch(setMessages([...messages, newMessage]));
      }
    });
  }, [socket, messages]);
};

export default useFetchRealTimeMessages;
