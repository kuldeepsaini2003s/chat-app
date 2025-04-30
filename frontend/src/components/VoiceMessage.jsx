import React from "react";

const VoiceMessage = ({ message, isSent }) => {
  return (
    <div className={`flex mb-2 max-w-[65%] ${isSent ? "ml-auto" : "mr-auto"}`}>
      <div
        className={`flex items-center rounded-2xl px-3 py-2 min-w-[180px] ${
          isSent ? "bg-[#d9fdd3]" : "bg-white"
        } shadow-sm`}
      >
        <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
          <i className="fas fa-play text-xs ml-0.5"></i>
        </div>
        <div className="flex-1 flex items-center gap-0.5 h-6">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="wave-bar"></div>
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-2">{message.duration}</span>
      </div>
    </div>
  );
};

export default React.memo(VoiceMessage);
