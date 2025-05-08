import React from "react";

const WelcomeScreen = () => {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <h2 className="text-3xl font-light text-gray-700 mb-4">Chatify</h2>
        <p className="text-gray-500 mb-2">Select a chat to start messaging</p>
        <p className="text-gray-400 text-sm">
          Or use the search bar above to find and connect with people
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
