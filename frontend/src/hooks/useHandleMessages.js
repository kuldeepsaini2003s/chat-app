import { useEffect, useRef } from "react";
import { emitEvent, getSocket, onEvent } from "../../socket/socket";
import { updateLastMessage } from "../redux/userSlice";
import {
  setMessages,
  updateMessageByTempId,
  updateMessageStatus,
} from "../redux/messageSlice";
import { useDispatch, useSelector } from "react-redux";

const useHandleMessages = () => {
  const { activeChat, user } = useSelector((state) => state?.user);
  const { messages } = useSelector((state) => state?.message);
  const dispatch = useDispatch();
  const socket = getSocket();

  // Used a ref to avoid stale closure on messages
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      const activeChatId = activeChat?.chatId?.toString();
      const newMessageChatId = newMessage?.chatId?.toString();
      const { tempId, ...finalMessage } = newMessage;
      if (
        activeChatId &&
        newMessageChatId &&
        activeChatId === newMessageChatId &&
        tempId
      ) {
        dispatch(
          updateMessageByTempId({
            tempId,
            newMessage: finalMessage,
          })
        );
      } else {
        dispatch(setMessages([...messages, finalMessage]));
      }

      emitEvent("lastMessage", {
        senderId: newMessage?.senderId,
        receiverId: newMessage?.receiverId,
      });

      if (user?._id === newMessage?.receiverId) {
        emitEvent("messageDelivered", { messageId: newMessage?._id });
      }
    };

    const handleLastMessage = (lastMessage) => {
      if (lastMessage) {
        dispatch(updateLastMessage(lastMessage));
      }
    };

    const handleMessageDelivered = (id) => {
      dispatch(updateMessageStatus({ id, status: "delivered" }));
    };

    onEvent("newMessage", handleNewMessage);
    onEvent("lastMessage", handleLastMessage);
    onEvent("messageDelivered", handleMessageDelivered);
  }, [socket, activeChat, dispatch]);
};

export default useHandleMessages;
