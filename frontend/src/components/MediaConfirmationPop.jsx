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
    <div className="bg-white rounded-md shadow-lg overflow-hidden">
      {/* Popup content */}
      <div className="p-4 pb-6">
        <h3 className="text-lg font-normal">Discard unsent message?</h3>
        <p className="text-sm mt-2">
          Your message, including attached media, will not be sent if you leave
          this screen.
        </p>
      </div>

      {/* Popup buttons */}
      <div className="flex px-4 pb-4 gap-3">
        <button
          onClick={handleDiscard}
          className="flex-1 text-white py-2 px-4 font-medium bg-green-600 rounded-md hover:bg-green-700 transition-colors text-center"
        >
          Discard
        </button>
        <button
          onClick={handleReturn}
          className="flex-1 py-2 px-4 font-medium bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-center"
        >
          Return to media
        </button>
      </div>
    </div>
  );
};

export default MediaConfirmationPop;
