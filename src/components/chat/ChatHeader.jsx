import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  ArrowLeftIcon, 
  CogIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const ChatHeader = ({ chat, onBack, onAddParticipant }) => {
  const { user } = useAuthStore();
  
  // For direct chats, show the other participant's name
  const getChatName = () => {
    if (!chat) return 'Loading...';
    
    if (chat.isGroup) {
      return chat.name || 'Group Chat';
    }
    
    // Find the other participant in the chat
    const otherParticipant = chat.participants?.find(
      participant => participant._id !== user?._id
    );
    
    return otherParticipant?.username || 'User';
  };
  
  // Get avatar for the chat (for direct chats, show other user's first letter)
  const getAvatar = () => {
    if (!chat) return null;
    
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
    const otherParticipant = chat.participants?.find(
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
  
  // Get online status text
  const getStatus = () => {
    if (!chat) return '';
    
    if (chat.isGroup) {
      return `${chat.participants?.length || 0} members`;
    }
    
    // Find the other participant
    const otherParticipant = chat.participants?.find(
      participant => participant._id !== user?._id
    );
    
    return otherParticipant?.status === 'online' ? 'Online' : 'Offline';
  };
  
  // Check if current user is the creator of the group
  const isCreator = () => {
    if (!chat || !chat.isGroup) return false;
    return chat.creator === user?._id;
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        {/* Back button (mobile only) */}
        <button 
          onClick={onBack} 
          className="mr-2 p-1 rounded-full text-gray-500 lg:hidden"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        
        {/* Avatar */}
        <div className="relative h-10 w-10 flex-shrink-0">
          {getAvatar()}
          
          {/* Online indicator (for direct chats) */}
          {!chat?.isGroup && getStatus() === 'Online' && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800" />
          )}
        </div>
        
        {/* Chat name and status */}
        <div className="ml-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {getChatName()}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getStatus()}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center">
        {/* Add participant button (only for group chats) */}
        {chat?.isGroup && (
          <button 
            onClick={onAddParticipant}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <UserPlusIcon className="h-5 w-5" />
          </button>
        )}
        
        {/* Settings button (for group chats if creator) */}
        {chat?.isGroup && isCreator() && (
          <Link 
            to={`/settings/chat/${chat._id}`}
            className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <CogIcon className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ChatHeader; 