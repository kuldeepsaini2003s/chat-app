import React from "react";

const WelcomeScreen = () => {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <h2 className="text-3xl font-light text-gray-700 mb-4">WhatsApp Web</h2>
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
