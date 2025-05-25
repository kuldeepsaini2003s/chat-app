import { useDispatch } from "react-redux";
import {
  setConfirmationPop,
  setMediaFiles,
  setMediaPreview,
} from "../redux/stateSlice";

const MediaConfirmationPop = () => {
  const dispatch = useDispatch();
  const handleDiscard = () => {
    dispatch(setMediaPreview(false));
    dispatch(setConfirmationPop(false));
    dispatch(setMediaFiles([]));
  };
  const handleReturn = () => {
    dispatch(setConfirmationPop(false));
  };
  return (
    <div className="bg-white dark:bg-black rounded-md max-[564px]:w-[95%] shadow-lg overflow-hidden">
      {/* Popup content */}
      <div className="p-4 pb-6">
        <h3 className="min-[564px]:text-lg font-normal">Discard unsent message?</h3>
        <p className="text-sm max-[564px]:text-xs mt-2">
          Your message, including attached media, will not be sent if you leave
          this screen.
        </p>
      </div>

      {/* Popup buttons */}
      <div className="flex px-4 pb-4 gap-3 text-sm max-[564px]:text-xs">
        <button
          onClick={handleDiscard}
          className="flex-1 text-white py-2 px-4 font-medium bg-green-500 rounded-md hover:bg-green-500 transition-colors text-center"
        >
          Discard
        </button>
        <button
          onClick={handleReturn}
          className="flex-1 py-2 px-4 font-medium border-[#c0c0c0] rounded-md border dark:border-lightBlack transition-colors text-center"
        >
          Return to media
        </button>
      </div>
    </div>
  );
};

export default MediaConfirmationPop;
