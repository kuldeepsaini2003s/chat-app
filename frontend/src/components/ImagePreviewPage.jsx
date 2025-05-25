import { Download, X } from "lucide-react";
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

  return (
    <div className="absolute p-2 max-ml:p-1 flex flex-col gap-2 text-white inset-0 z-50 w-full h-ful bg-black/70 backdrop-blur-lg backdrop-saturate-150">
      <div className="button-container text-text dark:text-darkText max-ml:text-sm flex max-[720px]:justify-end items-center gap-3 w-full">
        <h1 className="text-white w-full whitespace-normal break-words truncate max-[720px]:hidden">
          {imageUrl?.name}
        </h1>
        <button
          onClick={() => {
            handleDownload(imageUrl?.url, imageUrl?.name);
          }}
          className="cursor-pointer p-2 rounded-full hover:bg-[#303030]"
        >
          <Download className="max-ml:w-5" />
        </button>
        <button
          onClick={handleImagePreviewBack}
          className="cursor-pointer p-2 rounded-full hover:bg-[#303030]"
        >
          <X className="max-ml:w-5" />
        </button>
      </div>
      <div className="w-full h-[90%] flex justify-center items-center rounded-md">
        <img
          src={imageUrl?.url}
          ref={imagePreviewRef}
          className="object-contain min-w-48 max-w-full max-h-[100%] rounded-md"
          alt=""
        />
      </div>
    </div>
  );
};

export default ImagePreviewPage;
