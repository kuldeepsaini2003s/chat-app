import { Check, CheckCheck, Download } from "lucide-react";
import { formatBytes, formatTime } from "../utils/constant";
import { useSelector } from "react-redux";
import React, { useEffect, useRef } from "react";

const Message = ({ text, time, isSent, reaction, media, status }) => {
  const { messages } = useSelector((store) => store?.message);
  const handleOpen = (data, type) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  const handleDocOpen = (docUrl, type) => {
    // https://docs.google.com/viewerng/viewer?url=https://res.cloudinary.com/dbmszmntv/raw/upload/chat_app/Chat_App_2025-04-25T03-52-51-271Z.docx
    const url = `https://docs.google.com/viewer?url=${encodeURIComponent(
      docUrl
    )}&embedded=true`;
    window.open(url);
  };

  const handleDownload = (url, filename) => {
    // insert fl_attachment into the Cloudinary URL to download file
    const downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {media?.length > 0 ? (
        media?.map((media) => (
          <>
            {media?.file?.type?.startsWith("application/pdf") ? (
              <div
                ref={scrollRef}
                className={`message-bubble min-w-[20rem] flex flex-col rounded-md max-w-[20rem] rounded-xl bg-[#dcf8c6] p-3 shadow-md ${
                  isSent ? "sent" : "received"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img src="/PDF.svg" alt="doc" className="w-10 h-10" />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-900">
                      {media?.file?.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatBytes(media?.file?.size)}, Microsoft Edge PDF
                      Document
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-5 mt-3 mb-1">
                  <button
                    onClick={() => handleOpen(media?.file, "application/pdf")}
                    className="text-sm bg-white rounded-md p-2 w-full text-[#007bff] font-medium cursor-pointer"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDownload(media?.url, media?.file?.name)}
                    className="text-sm text-[#007bff] bg-white rounded-md p-2 w-full font-medium cursor-pointer"
                  >
                    Save
                  </button>
                </div>

                <div className="flex mt-2 justify-between items-end">
                  <span className="text-sm break-words">{media?.caption}</span>
                  <span className="text-[10px] flex gap-1  text-gray-500 pl-2 whitespace-nowrap">
                    {formatTime(time)}{" "}
                    <>
                      {status === "sent" && <Check size={14} />}
                      {status === "delivered" && <CheckCheck size={14} />}
                      {status === "seen" && (
                        <CheckCheck size={14} color="#4FB4E0" />
                      )}
                    </>
                  </span>
                </div>

                {reaction && (
                  <div className="absolute -right-2 -bottom-2 bg-white rounded-xl px-1 py-0.5 shadow-sm text-xs">
                    {reaction?.emoji} {reaction?.count}
                  </div>
                )}
              </div>
            ) : media?.file?.type?.startsWith("application/vnd") ? (
              <div
                ref={scrollRef}
                className={`message-bubble min-w-[20rem] flex flex-col rounded-md max-w-[20rem] rounded-xl bg-[#dcf8c6] p-3 shadow-sm ${
                  isSent ? "sent" : "received"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img src="/microsoftWord.svg" alt="doc" className="w-8 h-8" />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-900">
                      {media?.file?.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatBytes(media?.file?.size)}, Microsoft Office Word
                      Document
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => handleDocOpen(media?.file, "application/vnd")}
                  className="flex justify-between items-center gap-5 mt-3 mb-1"
                >
                  <button className="text-sm bg-white rounded-md p-2 w-full text-[#007bff] font-medium cursor-pointer">
                    Open
                  </button>
                  <button
                    onClick={() => handleDownload(media?.url, media?.file?.name)}
                    className="text-sm text-[#007bff] bg-white rounded-md p-2 w-full font-medium cursor-pointer"
                  >
                    Save
                  </button>
                </div>

                <div className="flex justify-between mt-2 items-end">
                  <span className="text-sm break-words">{media?.caption}</span>
                  <span className="text-[10px] flex gap-1  text-gray-500 pl-2 whitespace-nowrap">
                    {formatTime(time)}{" "}
                    <>
                      {status === "sent" && <Check size={14} />}
                      {status === "delivered" && <CheckCheck size={14} />}
                      {status === "seen" && (
                        <CheckCheck size={14} color="#4FB4E0" />
                      )}
                    </>
                  </span>
                </div>

                {reaction && (
                  <div className="absolute -right-2 -bottom-2 bg-white rounded-xl px-1 py-0.5 shadow-sm text-xs">
                    {reaction?.emoji} {reaction?.count}
                  </div>
                )}
              </div>
            ) : (
              <div
                ref={scrollRef}
                className={`text-sm message-bubble rounded-md max-w-[20rem] flex flex-col px-2 py-2 relative ${
                  isSent ? "sent" : "received"
                }`}
              >
                <button
                  onClick={() => handleDownload(media?.url, media?.name)}
                  className="cursor-pointer shadow-xl bg-white rounded-md p-2 absolute  right-4 top-3"
                >
                  <Download />
                </button>
                <img
                  src={media?.url}
                  alt=""
                  className="w-[20rem] rounded-md h-[20rem] object-cover"
                />
                <div className="flex mt-2 justify-between items-end">
                  <span className="text-sm break-words">{media?.caption}</span>
                  <span className="text-[10px] flex gap-1  text-gray-500 pl-2 whitespace-nowrap">
                    {formatTime(time)}{" "}
                    <>
                      {status === "sent" && <Check size={14} />}
                      {status === "delivered" && <CheckCheck size={14} />}
                      {status === "seen" && (
                        <CheckCheck size={14} color="#4FB4E0" />
                      )}
                    </>
                  </span>
                </div>
                {reaction && (
                  <div className="absolute -right-2 -bottom-2 bg-white rounded-xl px-1 py-0.5 shadow-sm text-xs">
                    {reaction.emoji} {reaction.count}
                  </div>
                )}
              </div>
            )}
          </>
        ))
      ) : (
        <div
          ref={scrollRef}
          className={`message-bubble ${
            isSent ? "sent" : "received"
          } px-2 py-2 rounded-lg max-w-[80%] flex flex-col relative bg-green-100`}
        >
          <div className="flex items-end">
            <span className="text-sm break-words">{text}</span>
            <span className="text-[10px] flex gap-1  text-gray-500 pl-2 whitespace-nowrap">
              {formatTime(time)}{" "}
              <>
                {status === "sent" && <Check size={14} />}
                {status === "delivered" && <CheckCheck size={14} />}
                {status === "seen" && <CheckCheck size={14} color="#4FB4E0" />}
              </>
            </span>
          </div>

          {reaction && (
            <div className="absolute -right-2 -bottom-2 bg-white rounded-xl px-1 py-0.5 shadow-sm text-xs">
              {reaction.emoji} {reaction.count}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default React.memo(Message);
