import { Check, CheckCheck, Clock, Download } from "lucide-react";
import { formatBytes, formatTime, handleDownload } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useRef } from "react";
import { setImagePreview, setImageUrl } from "../redux/stateSlice";

const Message = ({ text, time, isSent, media, status }) => {
  const ImageTypes = ["jpg", "png", "jpeg", "gif", "avif", "svg"];
  const { messages } = useSelector((store) => store?.message);
  const messageClass = isSent ? "sent" : "received";
  const dispatch = useDispatch();

  const handleOpenPDF = (url) => {
    window.open(url);
  };

  const handleDocOpen = (docUrl) => {
    const url = `https://docs.google.com/gview?url=${docUrl}&embedded=true`;
    window.open(url);
  };

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpenImagePreview = (url) => {
    if (window.innerWidth < 748) {
      const currentState = history.state;
      if (!currentState.imagePreview) {
        history.pushState({ ...currentState, imagePreview: true }, "");
      }
    }
    dispatch(setImageUrl(url));
    dispatch(setImagePreview(true));
  };

  return (
    <>
      {media?.length > 0 ? (
        media?.map((media, index) => (
          <>
            {ImageTypes.includes(media?.type) ? (
              <div
                ref={scrollRef}
                onClick={() =>
                  handleOpenImagePreview({ url: media?.url, name: media?.name })
                }
                className={`${
                  isSent
                    ? "bg-green dark:bg-darkGreen self-end"
                    : "self-start dark:bg-lightBlack bg-white"
                }  text-sm cursor-pointer message-bubble relative rounded-md max-w-[20rem] flex flex-col px-2 py-2 `}
              >
                {/* Image message card */}
                {status === "sending" && (
                  <div className="absolute inset-0 flex justify-center items-center bg-black/30 z-10 w-full h-full">
                    <div class="upload-loader"></div>
                  </div>
                )}
                <img
                  src={media?.url}
                  alt="image"
                  className="max-w-[25rem] rounded-md  max-h-[25rem] object-contain"
                />
                <div
                  className={`flex ${
                    index === 0 ? "justify-between" : "justify-end"
                  } mt-2 items-end`}
                >
                  {index === 0 && (
                    <span className="text-sm break-words">{text}</span>
                  )}
                  <span className="text-[10px] flex gap-1 dark:text-darkText pl-2 whitespace-nowrap">
                    {time && formatTime(time)}{" "}
                    {messageClass === "sent" && (
                      <>
                        {status === "sending" && <Clock size={14} />}
                        {status === "sent" && <Check size={14} />}
                        {status === "delivered" && <CheckCheck size={14} />}
                        {status === "seen" && (
                          <CheckCheck
                            size={14}
                            className="text-blue dark:text-darkBlue"
                          />
                        )}
                      </>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className={`${
                  isSent
                    ? "bg-green dark:bg-darkGreen self-end"
                    : "self-start dark:bg-lightBlack bg-white"
                }  message-bubble min-w-[20rem] flex flex-col rounded-md max-w-[20rem] rounded-xl p-3 shadow-sm`}
              >
                {/* Doc file message card */}
                <div className="flex items-center gap-4">
                  <img
                    src={media?.type === "pdf" ? "/PDF.svg" : "/word-1.svg"}
                    alt="doc"
                    className="w-8 h-8"
                  />
                  <div className="flex flex-col">
                    <p className="text-xs font-medium line-clamp-2">
                      {media?.name}
                    </p>
                    <p className="text-xs text-text dark:text-darkText">
                      {formatBytes(media?.size)},{" "}
                      {media?.type === "pdf"
                        ? "Microsoft Edge PDF Document."
                        : "Microsoft Office Word Document."}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => handleDocOpen(media?.url, "application/vnd")}
                  className="flex justify-between items-center gap-5 mt-3 mb-1"
                >
                  <button
                    disabled={status === "sending"}
                    className={`${
                      status === "sending"
                        ? "bg-gray-600 text-black cursor-not-allowed"
                        : "bg-white text-[#007bff] cursor-pointer"
                    } text-sm rounded-md p-2 w-full  font-medium`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDownload(media?.url, media?.name)}
                    disabled={status === "sending"}
                    className={`${
                      status === "sending"
                        ? "bg-gray-600 text-black cursor-not-allowed"
                        : "bg-white text-[#007bff] cursor-pointer"
                    } text-sm rounded-md p-2 w-full  font-medium`}
                  >
                    Save
                  </button>
                </div>

                <div
                  className={`flex ${
                    index === 0 ? "justify-between" : "justify-end"
                  } mt-2 items-end`}
                >
                  {index === 0 && (
                    <span className="text-sm flex-1 break-words">{text}</span>
                  )}
                  <span className="text-[10px] flex gap-1 dark:text-darkText pl-2 whitespace-nowrap">
                    {time && formatTime(time)}{" "}
                    {messageClass === "sent" && (
                      <>
                        {status === "sending" && <Clock size={14} />}
                        {status === "sent" && <Check size={14} />}
                        {status === "delivered" && <CheckCheck size={14} />}
                        {status === "seen" && (
                          <CheckCheck
                            size={14}
                            className="text-blue dark:text-darkBlue"
                          />
                        )}
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </>
        ))
      ) : (
        <div
          ref={scrollRef}
          className={`message-bubble ${
            isSent
              ? "bg-green dark:bg-darkGreen self-end"
              : "self-start dark:bg-lightBlack bg-white"
          } px-2 py-2 rounded-lg max-w-[80%] flex flex-col relative`}
        >
          <div className="flex items-end">
            <span className="text-sm break-words">{text}</span>
            <span className="text-[10px] flex gap-1 dark:text-darkText dark:text-[#E9EDEF] pl-2 whitespace-nowrap">
              {time && formatTime(time)}{" "}
              {messageClass === "sent" && (
                <>
                  {status === "sending" && <Clock size={12} />}
                  {status === "sent" && <Check size={14} />}
                  {status === "delivered" && <CheckCheck size={14} />}
                  {status === "seen" && (
                    <CheckCheck
                      size={14}
                      className="text-blue dark:text-darkBlue"
                    />
                  )}
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Message);
