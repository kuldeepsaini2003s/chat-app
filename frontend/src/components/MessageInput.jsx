import { useState, useRef, useEffect } from "react";
import EmojiSelector from "./EmojiSelector";
import { Paperclip, Smile } from "lucide-react";
import MediaPreview from "./MediaPreview";
import { useDispatch, useSelector } from "react-redux";
import { setMediaFiles, setMediaPreview } from "../redux/stateSlice";
import axios from "axios";
import { BACKEND_MESSAGE, LOCAL_MESSAGE } from "../utils/constant";

const MessageInput = () => {
  const { activeChat, user } = useSelector((store) => store?.user);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const attachOptionsRef = useRef(null);
  const fileInputRef = useRef(null);
  const documentRef = useRef(null);
  const mediaRef = useRef(null);
  const mediaPreviewRef = useRef(null);
  // const typingTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const { mediaPreview, mediaFiles } = useSelector((store) => store?.state);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        message: message,
        senderId: user?._id,
        receiverId: activeChat?._id,
        time: new Date(),
      };
      setMessage("");
      inputRef?.current?.focus();
      try {
        await axios.post(LOCAL_MESSAGE + "/send", newMessage);
      } catch (error) {
        console.error("Error while sending message", error);
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
      if (
        mediaPreviewRef.current &&
        !mediaPreviewRef.current.contains(e.target)
      ) {
        setShowConfirmationPop(true);
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
    <div>
      <div className="p-3 bg-gray-100 flex items-center relative">
        <div className="flex gap-3 text-gray-600">
          <button
            className="hover:text-gray-800"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={18} />
          </button>
          <button
            className="hover:text-gray-800"
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
            className="absolute bottom-14 left-12 bg-white rounded-xl shadow-lg z-10"
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
                className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg"
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
                className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-[#5157ae] text-white flex items-center justify-center mr-3">
                  <i className="fas fa-file-alt text-xs"></i>
                </div>
                <span>Document</span>
              </button>
              <button className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-[#ff3b5c] text-white flex items-center justify-center mr-3">
                  <i className="fas fa-camera text-xs"></i>
                </div>
                <span>Camera</span>
              </button>
              <button className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-[#0aa679] text-white flex items-center justify-center mr-3">
                  <i className="fas fa-user text-xs"></i>
                </div>
                <span>Contact</span>
              </button>
            </div>
          </div>
        )}

        {mediaPreview && (
          <div ref={mediaPreviewRef} className="absolute bottom-3 left-3 z-10">
            <MediaPreview inputRef={inputRef} />
          </div>
        )}

        <input
          type="text"
          className="flex-1 mx-3 px-3 py-2 p-2 bg-white rounded-lg border border-gray-200 outline-none text-sm"
          placeholder="Type a message"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          ref={inputRef}
        />
        <button
          className={`text-gray-600 hover:text-gray-800 ${
            message.trim() ? "text-green-500" : ""
          }`}
          onClick={handleSendMessage}
        >
          {message.trim() ? (
            <i className="fas fa-paper-plane"></i>
          ) : (
            <i className="fas fa-microphone"></i>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
