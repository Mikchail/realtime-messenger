import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { formatChatTime } from '../../utils/dateFormat';

const ChatItem = ({ chat, isActive, unreadCount = 0 }) => {
  const { user } = useAuthStore();

  // For direct chats, show the other participant's name
  const getChatName = () => {
    if (chat.isGroup) {
      return chat.name;
    }
    
    // Find the other participant in the chat
    const otherParticipant = chat.participants.find(
      participant => participant._id !== user?._id
    );
    
    return otherParticipant?.username || 'User';
  };

  // Get avatar for the chat (for direct chats, show other user's first letter)
  const getAvatar = () => {
    if (chat.isGroup) {
      if (chat.custom?.icon) {
        return (
          <img
            src={chat.custom.icon}
            alt={chat.name}
            className="h-full w-full rounded-full object-cover"
          />
        );
      }
      
      // Default group icon
      return (
        <div className="h-full w-full rounded-full bg-primary-600 flex items-center justify-center text-white">
          {chat.name?.charAt(0).toUpperCase() || 'G'}
        </div>
      );
    }
    
    // Find the other participant
    const otherParticipant = chat.participants.find(
      participant => participant._id !== user?._id
    );
    
    if (otherParticipant?.avatar) {
      return (
        <img
          src={otherParticipant.avatar}
          alt={otherParticipant.username}
          className="h-full w-full rounded-full object-cover"
        />
      );
    }
    
    // Default user avatar with first letter
    return (
      <div className="h-full w-full rounded-full bg-gray-500 flex items-center justify-center text-white">
        {otherParticipant?.username?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  // Get last message text preview (truncate if too long)
  const getLastMessagePreview = () => {
    if (!chat.lastMessage) {
      return 'No messages yet';
    }
    
    // Check if current user is the sender
    const isSender = chat.lastMessage.sender?._id === user?._id;
    const prefix = isSender ? 'You: ' : '';
    const text = chat.lastMessage.text || '';
    
    // Truncate if needed
    return text.length > 35
      ? `${prefix}${text.substring(0, 35)}...`
      : `${prefix}${text}`;
  };

  // Format last message time
  const getLastMessageTime = () => {
    if (!chat.lastMessage?.createdAt) {
      return '';
    }
    
    return formatChatTime(chat.lastMessage.createdAt);
  };

  // Check if user is online
  const isOnline = () => {
    if (chat.isGroup) {
      return false; // Groups don't have online status
    }
    
    // Find the other participant
    const otherParticipant = chat.participants.find(
      participant => participant._id !== user?._id
    );
    
    return otherParticipant?.status === 'online';
  };

  return (
    <Link
      to={`/chats/${chat._id}`}
      className={`block border-b border-gray-200 dark:border-gray-700 ${
        isActive 
          ? 'bg-primary-50 dark:bg-primary-900/20' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            {/* Avatar */}
            <div className="relative flex-shrink-0 h-10 w-10">
              {getAvatar()}
              
              {/* Online indicator */}
              {isOnline() && (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800" />
              )}
            </div>
            
            <div className="min-w-0 flex-1 px-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                  {getChatName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                  {getLastMessageTime()}
                </p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {getLastMessagePreview()}
                </p>
                
                {/* Unread count badge */}
                {unreadCount > 0 && (
                  <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-500 text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChatItem; 