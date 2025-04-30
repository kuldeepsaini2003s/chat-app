import { emojis } from "../data/emojis";

const EmojiSelector = ({ onSelect }) => {
  return (
    <div className="emoji-selector">
      <div className="grid grid-cols-7 shadow-2xl h-40 bg-white rounded-md p-1 overflow-y-scroll remove-scrollbar">
        {emojis.map((emoji, index) => (
          <div
            key={index}
            className="emoji cursor-pointer"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiSelector;
