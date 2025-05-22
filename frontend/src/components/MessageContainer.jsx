import { useDispatch, useSelector } from "react-redux";
import Message from "./Message";
import VoiceMessage from "./VoiceMessage";
import { useEffect } from "react";
import { updateMessageStatus } from "../redux/messageSlice";
import { emitEvent, onEvent } from "../../socket/socket";

const MessagesContainer = () => {
  const { messages } = useSelector((store) => store?.message);
  const { user, activeChat } = useSelector((store) => store?.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (activeChat && messages?.length > 0) {
      const hasUnseenMessages = messages?.some(
        (msg) =>
          msg?.senderId === activeChat?._id &&
          msg?.receiverId === user?._id &&
          msg?.status === "delivered"
      );

      if (hasUnseenMessages) {
        emitEvent("messageSeen", {
          senderId: activeChat?._id,
          receiverId: user?._id,
        });
      }

      onEvent("messageSeen", (id) => {
        emitEvent("lastMessage", {
          senderId: activeChat?._id,
          receiverId: user?._id,
        });
        dispatch(updateMessageStatus({ id, status: "seen" }));
      });
    }
  }, [activeChat, messages]);

  return (
    <div className="flex-1 pb-5 bg-[url('../../public/WhiteBackground.svg')] dark:bg-[url('../../public/BlackBackground.svg')] p-2 chat-container-scrollbar">
      <div className="flex  flex-col gap-2">
        {messages?.map((message) =>
          message.type === "voice" ? (
            <VoiceMessage
              key={message?._id}
              message={message}
              isSent={user?._id === message?.senderId && true}
            />
          ) : (
            <Message
              key={message?._id}
              text={message?.message}
              time={message?.time}
              isSent={user?._id === message?.senderId && true}
              media={message?.media}
              status={message?.status}
            />
          )
        )}
      </div>
    </div>
  );
};

export default MessagesContainer;
