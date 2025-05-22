import React from "react";
import ChatContainer from "./ChatContainer";
import WelcomeScreen from "./WelcomeScreen";
import { useSelector } from "react-redux";
import ImagePreviewPage from "./ImagePreviewpage";
import Sidebar from "./Sidebar";

const Body = () => {
  const { activeChat } = useSelector((state) => state.user);
  const { imagePreview } = useSelector((state) => state.state);

  return (
    <div className={`flex max-[748px]:flex-col h-svh`}>
      <Sidebar />
      <div
        className={`flex ${
          !activeChat ? "max-[748px]:hidden" : ""
        } w-full flex-col h-svh relative w-3/4`}
      >
        {activeChat ? <ChatContainer /> : <WelcomeScreen />}
      </div>
      {imagePreview && <ImagePreviewPage />}
    </div>
  );
};

export default Body;
