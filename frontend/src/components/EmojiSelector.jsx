import { emojis } from "../data/emojis";

const EmojiSelector = ({ onSelect }) => {
  return (
    <div className="shadow-2xl h-60 bg-white dark:bg-black border-b rounded-b-none rounded-md p-2 overflow-hidden">
      <h1 className="pl-1">Smileys & people</h1>
      <div className="grid grid-cols-7 h-full overflow-y-scroll remove-scrollbar pb-5">
        {emojis.map((emoji, index) => (
          <div
            key={index}
            className="cursor-pointer text-2xl"
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
