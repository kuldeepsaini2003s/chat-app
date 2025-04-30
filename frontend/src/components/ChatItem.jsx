const ChatItem = ({ chat, isActive, onClick }) => {   
  return (
    <div 
      className={`flex p-2 rounded-md border-gray-100 cursor-pointer transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 overflow-hidden flex-shrink-0">
        <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="font-medium truncate">{chat.name}</span>
          <span className="text-xs text-gray-500">{chat.time}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>          
          {chat.unreadCount > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatItem