import { Check, CheckCheck, Download } from "lucide-react";
import { formatBytes, formatTime } from "../utils/constant";
import { useSelector } from "react-redux";
import React, { useEffect, useRef } from "react";

const Message = ({ text, time, isSent, reaction, media, status }) => {
  const ImageTypes = ["jpg", "png", "jpeg", "gif", "avif", "svg"];
  const { messages } = useSelector((store) => store?.message);

  const handleOpenPDF = (url) => {
    window.open(url);
  };

  const handleDocOpen = (docUrl, type) => {
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
        media?.map((media, index) => (
          <>
            {media?.type === "pdf" ? (
              <div
                ref={scrollRef}
                className={`message-bubble min-w-[20rem] flex flex-col rounded-md max-w-[20rem] rounded-xl bg-[#dcf8c6] p-3 shadow-md ${
                  isSent ? "sent" : "received"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img src="/PDF.svg" alt="pdf" className="w-10 h-10" />
                  <div className="flex flex-col">
                    <p className="text-xs line-clamp-2 font-medium text-gray-900">
                      {media?.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatBytes(media?.size)}, Microsoft Edge PDF Document.
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-5 mt-3 mb-1">
                  <button
                    onClick={() => handleOpenPDF(media?.url)}
                    className="text-sm bg-white rounded-md p-2 w-full text-[#007bff] font-medium cursor-pointer"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDownload(media?.url, media?.name)}
                    className="text-sm text-[#007bff] bg-white rounded-md p-2 w-full font-medium cursor-pointer"
                  >
                    Save
                  </button>
                </div>

                <div className="flex mt-2 justify-between items-end">
                  {index === 0 && (
                    <span className="text-sm break-words">{text}</span>
                  )}
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
            ) : ImageTypes.includes(media?.type) ? (
              <div
                ref={scrollRef}
                className={`text-sm message-bubble rounded-md max-w-[20rem] flex flex-col px-2 py-2 relative ${
                  isSent ? "sent" : "received"
                }`}
              >
                <button
                  onClick={() => handleDownload(media?.url, media?.name)}
                  className="cursor-pointer shadow-xl bg-white rounded-md p-2 absolute  right-3 top-3"
                >
                  <Download size={17} />
                </button>
                <img
                  src={media?.url}
                  alt="image"
                  className="max-w-[25rem] rounded-md  max-h-[25rem] object-contain"
                />
                <div className="flex mt-2 justify-between items-end">
                  {index === 0 && (
                    <span className="text-sm break-words">{text}</span>
                  )}
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
              </div>
            ) : (
              <div
                ref={scrollRef}
                className={`message-bubble min-w-[20rem] flex flex-col rounded-md max-w-[20rem] rounded-xl bg-[#dcf8c6] p-3 shadow-sm ${
                  isSent ? "sent" : "received"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img src="/microsoftWord.svg" alt="doc" className="w-8 h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs font-medium line-clamp-2 text-gray-900">
                      {media?.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatBytes(media?.size)}, Microsoft Office Word
                      Document.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => handleDocOpen(media?.url, "application/vnd")}
                  className="flex justify-between items-center gap-5 mt-3 mb-1"
                >
                  <button className="text-sm bg-white rounded-md p-2 w-full text-[#007bff] font-medium cursor-pointer">
                    Open
                  </button>
                  <button
                    onClick={() => handleDownload(media?.url, media?.name)}
                    className="text-sm text-[#007bff] bg-white rounded-md p-2 w-full font-medium cursor-pointer"
                  >
                    Save
                  </button>
                </div>

                <div className="flex justify-between mt-2 items-end">
                  {index === 0 && (
                    <span className="text-sm break-words">{text}</span>
                  )}
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
