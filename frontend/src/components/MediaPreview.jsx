import { X, Smile, Trash2, Plus, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setConfirmationPop,
  setMediaFiles,
  setMediaPreview,
} from "../redux/stateSlice";
import EmojiSelector from "./EmojiSelector";
import { BACKEND_MESSAGE } from "../utils/constant";
import axios from "axios";

const MediaPreview = ({ inputRef }) => {
  const [caption, setCaption] = useState("");
  const [mediaSelected, setMediaSelected] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const documentRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { mediaFiles } = useSelector((store) => store?.state);
  const { user, activeChat } = useSelector((store) => store?.user);
  const dispatch = useDispatch();
  const captionRef = useRef(null);

  useEffect(() => {
    if (mediaFiles.length > 0) {
      captionRef?.current?.focus();
    }
  }, [mediaFiles]);

  const handleSelectedMedia = (media) => {
    setMediaSelected(media);
  };

  const removeMedia = () => {
    const updateMedia = mediaFiles?.filter(
      (_, index) => index !== mediaSelected
    );
    dispatch(setMediaFiles(updateMedia));

    if (mediaSelected >= updateMedia?.length) {
      setMediaSelected(updateMedia?.length - 1);
    }

    if (updateMedia?.length === 0) {
      setMediaPreview(false);
    }
  };

  const closeMedia = () => {
    dispatch(setConfirmationPop(true));
  };

  const handleSend = async () => {
    const payload = new FormData();
    mediaFiles?.forEach((file, index) => {
      payload.append("media", file.file);
      if (index === 0) {
        payload.append("message", caption ? caption.trim() : "");
      }
    });
    payload.append("time", new Date());
    payload.append("senderId", user?._id);
    payload.append("receiverId", activeChat._id);

    inputRef.current.focus();
    dispatch(setMediaPreview(false));
    dispatch(setMediaFiles([]));
    setCaption("");

    try {
      await axios.post(BACKEND_MESSAGE + "/mediaUpload", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Error while sending message", error);
    }
  };

  const handleAddFile = () => {
    documentRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const mediaUrls = files?.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      dispatch(setMediaFiles([...mediaFiles, ...mediaUrls]));
    }
  };

  const addEmoji = (emoji) => {
    setCaption((prev) => prev + emoji);
    captionRef?.current.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef?.current &&
        !emojiPickerRef?.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col w-[45vw] h-[80vh] rounded-md shadow-2xl bg-gray-100 text-gray-800">
      {/* Header */}
      <div className="flex items-center gap-5 justify-end bg-white rounded-t-md border-b p-1 border-gray-200">
        <button
          onClick={removeMedia}
          className="p-1 text-gray-600 hover:bg-gray-200 rounded-full hover:text-gray-800"
        >
          <Trash2 size={22} />
        </button>
        <button
          onClick={closeMedia}
          className="p-1 text-gray-600 hover:bg-gray-200 rounded-full hover:text-gray-800"
        >
          <X size={22} />
        </button>
      </div>
      {/* Media Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-200">
        <input
          onChange={handleFileChange}
          type="file"
          ref={documentRef}
          multiple
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <div className="relative w-full h-full max-h-[51vh] flex flex-col items-center justify-around">
          <button
            onClick={handleAddFile}
            className="absolute cursor-pointer right-2 bottom-1 bg-green-600 hover:bg-green-700 rounded-full p-2 ml-2"
          >
            <Plus size={24} className="text-white" />
          </button>
          {mediaFiles[mediaSelected]?.file?.type?.startsWith("image/") && (
            <img
              src={mediaFiles[mediaSelected]?.url}
              alt="Selected media preview"
              className="w-full max-h-full object-contain"
            />
          )}
          {mediaFiles[mediaSelected]?.file?.type?.startsWith(
            "application/vnd"
          ) && (
            <>
              <img
                src="/microsoftWord.svg"
                alt="Selected media preview"
                className="w-full max-h-[50%] object-contain"
              />
              <p className="text-sm">{mediaFiles[mediaSelected]?.file?.name}</p>
            </>
          )}
          {mediaFiles[mediaSelected]?.file?.type?.startsWith("video/") && (
            <video
              src={mediaFiles[mediaSelected]?.url}
              controls
              alt="Selected media preview"
              className="w-full max-h-full object-contain"
            ></video>
          )}
          {mediaFiles[mediaSelected]?.file?.type?.startsWith(
            "application/pdf"
          ) && (
            <>
              <img
                src="/PDF.svg"
                alt="Selected media preview"
                className="w-[20%] object-contain"
              />
              <p className="text-sm">{mediaFiles[mediaSelected]?.file?.name}</p>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-5 border-y border-gray-300 shadow-md px-2 pt-2 pb-3">
        {mediaFiles.map((media, index) => (
          <div key={index}>
            {media?.file?.type?.startsWith("application/pdf") ? (
              <div
                onClick={() => handleSelectedMedia(index)}
                className={`w-14 h-12 relative rounded-md flex justify-center items-center bg-gray-300 shadow-2xl`}
              >
                <img
                  src="/PDF.svg"
                  className="w-[40%] object-center object-contain"
                  alt="media"
                />
                {mediaSelected === index && (
                  <p className="border-b-[3px] border-green-600 rounded-full w-[90%] absolute -bottom-2 "></p>
                )}
              </div>
            ) : media?.file?.type?.startsWith("application/vnd") ? (
              <div
                onClick={() => handleSelectedMedia(index)}
                className={`w-14 h-12 relative rounded-md flex justify-center items-center bg-gray-300 shadow-2xl`}
              >
                <img
                  src="/microsoftWord.svg"
                  className="w-[50%] object-center object-contain"
                  alt="media"
                />
                {mediaSelected === index && (
                  <p className="border-b-[3px] border-green-600 rounded-full w-[90%] absolute -bottom-2 "></p>
                )}
              </div>
            ) : (
              <div
                onClick={() => handleSelectedMedia(index)}
                className={`w-14 h-12 relative rounded-md flex justify-center items-center bg-gray-300 shadow-2xl`}
              >
                <img
                  src={media?.url}
                  className="w-full h-full object-center rounded-md object-contain"
                  alt="media"
                />
                {mediaSelected === index && (
                  <p className="border-b-[3px] border-green-600 rounded-full w-[90%] absolute -bottom-2 "></p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption Input Area */}
      <div className="rounded-b-md bg-white border-t border-gray-200">
        <div className="flex px-2 py-4 items-center rounded-md bg-gray-100 rounded-full p-1">
          <div className="flex-1 gap-2 flex items-center">
            <div ref={emojiPickerRef}>
              <button
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="text-gray-500 cursor-pointer"
              >
                <Smile size={20} />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-14 left-3 z-10">
                  <EmojiSelector onSelect={addEmoji} />
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Add a caption..."
              ref={captionRef}
              className="flex-1 bg-transparent outline-none px-2 text-gray-800 placeholder-gray-500"
              value={caption}
              onKeyDown={(e) => {
                if (e?.key === "Enter") {
                  handleSend();
                }
              }}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <button
            onClick={handleSend}
            className="bg-green-600 rounded-full p-2 ml-2 cursor-pointer"
          >
            <SendHorizontal size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;
