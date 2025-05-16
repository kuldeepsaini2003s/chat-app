import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MediaConfirmationPop from "./MediaConfirmationPop";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageContainer from "./MessageContainer";
import { setMessages } from "../redux/messageSlice";
import { BACKEND_MESSAGE } from "../utils/constant";
import axios from "axios";

const ChatContainer = () => {
  const { confirmationPop } = useSelector((store) => store?.state);
  const { activeChat, user } = useSelector((store) => store?.user);
  const { messages } = useSelector((store) => store?.message);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.post(`${BACKEND_MESSAGE}/`, {
          senderId: user?._id,
          receiverId: activeChat?._id,
        });
        if (data.success) {
          dispatch(setMessages(data?.data));
        }
      } catch (error) {
        console.error("Error while fetching data", error);
        dispatch(setMessages([]));
      }
    };

    if (activeChat && messages.length === 0) {
      fetchData();
    }
  }, [activeChat]);

  return (
    <div className="flex flex-col h-svh">
      <ChatHeader />
      <MessageContainer />
      <MessageInput />
      {confirmationPop && (
        <div className="absolute z-10 h-svh top-0 w-full flex items-center justify-center">
          <MediaConfirmationPop />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
