import React from "react";

const WelcomeScreen = () => {
  return (
    <div className="flex items-center text-text dark:text-darkText justify-center h-full">
      <div className="text-center">
        <h2 className="text-3xl font-light mb-4 dark:text-white text-black">
          Chatify
        </h2>
        <p className=" mb-2">Select a chat to start messaging</p>
        <p className="text-sm">
          Or use the search bar above to find and connect with people
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
