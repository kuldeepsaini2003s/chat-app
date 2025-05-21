import { ArrowLeft, Download } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setImagePreview, setImageUrl } from "../redux/stateSlice";
import { handleDownload } from "../utils/constant";

const ImagePreviewPage = () => {
  const imagePreviewRef = useRef(null);
  const dispatch = useDispatch();
  const { imageUrl } = useSelector((store) => store?.state);

  const handleImagePreviewBack = () => {
    const currentState = { ...history.state };
    if (currentState.imagePreview) {
      delete currentState.imagePreview;
      history.replaceState(currentState, "");
    }
    dispatch(setImagePreview(false));
    dispatch(setImageUrl(null));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest(".button-container")) return;

      if (
        imagePreviewRef?.current &&
        !imagePreviewRef?.current.contains(e.target)
      ) {
        dispatch(setImagePreview(false));
        dispatch(setImageUrl(null));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state || {};

      if (!state.imagePreview) {
        dispatch(setImagePreview(false));
        dispatch(setImageUrl(null));
      }

      if (!state.chatOpen) {
        dispatch(setActiveChat(null));
        sessionStorage.removeItem("activeChat");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="absolute p-2 max-ml:p-1 flex flex-col  gap-2 text-white inset-0 z-50 w-full h-ful bg-black/70 backdrop-blur-lg backdrop-saturate-150">
      <div className="button-container max-ml:text-sm flex items-center gap-3 w-full">
        <button
          onClick={handleImagePreviewBack}
          className="cursor-pointer p-1 rounded-full hover:bg-[#303030]"
        >
          <ArrowLeft className="w-10 max-ml:w-5" />
        </button>
        <h1 className="w-full">{imageUrl?.name}</h1>
        <button
          onClick={() => {
            handleDownload(imageUrl?.url, imageUrl?.name);
          }}
          className="cursor-pointer"
        >
          <Download className="w-10 max-ml:w-5" />
        </button>
      </div>
      <div className="w-full h-[90%] flex justify-center items-center rounded-md">
        <img
          src={imageUrl?.url}
          ref={imagePreviewRef}
          className="object-contain min-w-48 max-w-[90%] max-ml:max-w-full max-h-[100%] rounded-md"
          alt=""
        />
      </div>
    </div>
  );
};

export default ImagePreviewPage;
