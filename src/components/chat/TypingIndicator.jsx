import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

const TypingIndicator = ({ chatId }) => {
  const { isTyping } = useChatStore();
  const { user } = useAuthStore();
  const { currentChat } = useChatStore();
  
  // Get typing users for this chat
  const typingUsers = isTyping[chatId] || [];
  
  // Filter out current user
  const otherTypingUsers = typingUsers.filter(id => id !== user?._id);
  
  // Don't show anything if no one is typing
  if (otherTypingUsers.length === 0) {
    return null;
  }
  
  // Find the usernames of typing users
  const getTypingUsernames = () => {
    if (!currentChat) return 'Someone is typing...';
    
    const typingParticipants = currentChat.participants.filter(
      participant => otherTypingUsers.includes(participant._id)
    );
    
    if (typingParticipants.length === 0) {
      return 'Someone is typing...';
    }
    
    if (typingParticipants.length === 1) {
      return `${typingParticipants[0].username} is typing...`;
    }
    
    if (typingParticipants.length === 2) {
      return `${typingParticipants[0].username} and ${typingParticipants[1].username} are typing...`;
    }
    
    return 'Several people are typing...';
  };
  
  return (
    <div className="flex items-center text-sm text-gray-500 py-1 px-4">
      <div className="flex space-x-1 mr-2">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="italic">{getTypingUsernames()}</span>
    </div>
  );
};

export default TypingIndicator; 