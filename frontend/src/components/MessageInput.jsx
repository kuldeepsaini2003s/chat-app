import { useState, useRef, useEffect } from "react";
import EmojiSelector from "./EmojiSelector";
import { Mic, Paperclip, Smile } from "lucide-react";
import { v4 as uuid } from "uuid";
import MediaPreview from "./MediaPreview";
import { useDispatch, useSelector } from "react-redux";
import { setMediaFiles, setMediaPreview } from "../redux/stateSlice";
import axios from "axios";
import { BACKEND_MESSAGE } from "../utils/constant";
import useResponseHandler from "../hooks/useResponseHandler";
import { setMessages } from "../redux/messageSlice";

const MessageInput = () => {
  const { handleError } = useResponseHandler();
  const { activeChat, user } = useSelector((store) => store?.user);
  const { messages } = useSelector((store) => store?.message);
  const { mediaPreview, mediaFiles } = useSelector((store) => store?.state);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const attachOptionsRef = useRef(null);
  const fileInputRef = useRef(null);
  const documentRef = useRef(null);
  const mediaRef = useRef(null);
  const tempId = uuid();
  const dispatch = useDispatch();
  // const typingTimeoutRef = useRef(null);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        message: message,
        senderId: user?._id,
        receiverId: activeChat?._id,
      };
      dispatch(
        setMessages([
          ...messages,
          { ...newMessage, _id: tempId, status: "sending" },
        ])
      );
      setMessage("");
      inputRef?.current?.focus();
      try {
        await axios.post(BACKEND_MESSAGE + "/send", { ...newMessage, tempId });
      } catch (error) {
        handleError({
          error,
          message: error?.response?.data?.msg,
        });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    inputRef.current.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        attachOptionsRef.current &&
        !attachOptionsRef.current.contains(e.target)
      ) {
        setShowAttachOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      mediaFiles.forEach((media) => URL.revokeObjectURL(media));
    };
  }, [mediaFiles]);

  const handleFile = () => {
    fileInputRef.current.click();
  };

  const handleDoc = () => {
    documentRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files?.length > 0) {
      const mediaUrls = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      if (window.innerWidth < 748) {
        const currentState = history.state;
        if (!currentState.mediaPreview) {
          history.pushState({ ...currentState, mediaPreview: true }, "");
        }
      }
      dispatch(setMediaFiles(mediaUrls));
      dispatch(setMediaPreview(true));
    } else {
      dispatch(setMediaPreview(true));
    }
    mediaRef?.current?.focus();
    e.target.value = null;
  };

  let typingTimeout;

  if (!activeChat) return null;

  const handleInputChange = (e) => {
    // User starts typing
    // setIsTyping(true);
    setMessage(e.target.value);

    // // Clear the previous timeout
    // if (typingTimeoutRef.current) {
    //   clearTimeout(typingTimeoutRef.current);
    // }

    // // Set a new timeout to detect when user stops typing
    // typingTimeoutRef.current = setTimeout(() => {
    //   setIsTyping(false);
    // }, 500);
  };

  return (
    <>
      <div className="p-2 flex gap-2 items-center relative">
        <div className="flex items-center">
          <button
            className="hover:bg-lightGray dark:hover:bg-lightBlack p-2 rounded-full"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={18} />
          </button>
          <button
            className="hover:bg-lightGray dark:hover:bg-lightBlack p-2 rounded-full"
            onClick={() => setShowAttachOptions(!showAttachOptions)}
          >
            <Paperclip size={18} />
          </button>
        </div>

        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-14 left-3 z-10">
            <EmojiSelector onSelect={addEmoji} />
          </div>
        )}

        {showAttachOptions && (
          <div
            ref={attachOptionsRef}
            className="absolute bottom-14 left-12 bg-white dark:bg-black rounded-xl shadow-lg z-10"
          >
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="input hidden"
              />
              <button
                onClick={handleFile}
                className="flex items-center px-4 py-2 hover:bg-lightGray dark:hover:bg-lightBlack dark:hover:bg-lightBlack rounded-t-xl"
              >
                <div className="w-6 h-6 rounded-full bg-[#7f66ff] text-white flex items-center justify-center mr-3">
                  <i className="fas fa-images text-xs"></i>
                </div>
                <span>Photos & Videos</span>
              </button>
              <input
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                multiple
                ref={documentRef}
                className="document-input hidden"
              />
              <button
                onClick={handleDoc}
                className="flex items-center px-4 py-2 hover:bg-lightGray dark:hover:bg-lightBlack"
              >
                <div className="w-6 h-6 rounded-full bg-[#5157ae] text-white flex items-center justify-center mr-3">
                  <i className="fas fa-file-alt text-xs"></i>
                </div>
                <span>Document</span>
              </button>
              <button className="flex items-center px-4 py-2 hover:bg-lightGray dark:hover:bg-lightBlack">
                <div className="w-6 h-6 rounded-full bg-[#ff3b5c] text-white flex items-center justify-center mr-3">
                  <i className="fas fa-camera text-xs"></i>
                </div>
                <span>Camera</span>
              </button>
              <button className="flex items-center px-4 py-2 hover:bg-lightGray dark:hover:bg-lightBlack rounded-b-xl">
                <div className="w-6 h-6 rounded-full bg-[#0aa679] text-white flex items-center justify-center mr-3">
                  <i className="fas fa-user text-xs"></i>
                </div>
                <span>Contact</span>
              </button>
            </div>
          </div>
        )}

        {mediaPreview && (
          <div className="absolute bottom-0 w-full left-0 z-10">
            <MediaPreview inputRef={inputRef} />
          </div>
        )}

        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-full border border-lightGray dark:border-lightBlack outline-none text-sm"
          placeholder="Type a message"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          ref={inputRef}
        />
        <button
          className={`hover:bg-lightGray flex-shrink-0 dark:hover:bg-lightBlack p-2 rounded-full ${
            message.trim() ? "text-green-500" : ""
          }`}
          onClick={handleSendMessage}
        >
          {message.trim() ? (
            <i className="fas fa-paper-plane"></i>
          ) : (
            <Mic size={18} />
          )}
        </button>
      </div>
    </>
  );
};

export default MessageInput;
