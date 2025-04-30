import { useDispatch, useSelector } from "react-redux";
import Message from "./Message";
import VoiceMessage from "./VoiceMessage";
import { useEffect } from "react";
import { setMessages, updateMessageStatus } from "../redux/messageSlice";
import { emitEvent, getSocket, onEvent } from "../../socket/socket";
import useFetchRealTimeMessages from "../hooks/useFetchRealTimeMessages";

const MessagesContainer = () => {
  useFetchRealTimeMessages();
  const { messages } = useSelector((store) => store.message);
  const { user, activeChat } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const socket = getSocket();

  useEffect(() => {
    onEvent("messageDelivered", (id) => {
      dispatch(updateMessageStatus({ id, status: "delivered" }));
    });
  }, [socket, messages]);

  useEffect(() => {
    if (activeChat && messages.length > 0) {
      const hasUnseenMessages = messages.some(
        (msg) =>
          msg.senderId === activeChat?._id &&
          msg.receiverId === user._id &&
          msg.status === "delivered"
      );
      console.log("working", hasUnseenMessages);

      if (hasUnseenMessages) {
        emitEvent("messageSeen", {
          senderId: activeChat?._id,
          receiverId: user?._id,
        });
      }

      onEvent("messageSeen", (id) => {
        dispatch(updateMessageStatus({ id, status: "seen" }));
      });
    }
  }, [activeChat, user, messages]);

  return (
    <div className="flex-1 p-4 chat-container-scrollbar">
      <div className="flex  flex-col gap-2">
        {messages?.map((message) =>
          message.type === "voice" ? (
            <VoiceMessage
              key={message._id}
              message={message}
              isSent={user?._id === message.senderId && true}
            />
          ) : (
            <Message
              key={message._id}
              text={message.message}
              time={message.time}
              isSent={user?._id === message.senderId && true}
              media={message.media}
              status={message.status}
              reaction={message.reaction}
            />
          )
        )}
      </div>
    </div>
  );
};

export default MessagesContainer;
