import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { formatMessageTime } from '../../utils/dateFormat';
import { TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

const Message = ({ message, onDelete }) => {
  const { user } = useAuthStore();
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);
  
  // Check if current user is the sender
  const isCurrentUserSender = message.sender?._id === user?._id;
  
  // Format message time
  const timeString = formatMessageTime(message.createdAt);
  
  // Handle outside click to close actions menu
  const handleOutsideClick = (e) => {
    if (actionsRef.current && !actionsRef.current.contains(e.target)) {
      setShowActions(false);
    }
  };
  
  // Add event listener when actions menu opens
  const toggleActions = () => {
    if (!showActions) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    setShowActions(!showActions);
  };
  
  // Handle message deletion
  const handleDelete = () => {
    if (onDelete) {
      onDelete(message._id);
    }
    setShowActions(false);
  };
  
  // Get read status
  const getReadStatus = () => {
    if (!message.readBy || !Array.isArray(message.readBy)) {
      return 'Sent';
    }
    
    // If message is from current user, show how many others have read it
    if (isCurrentUserSender) {
      // Filter out the sender from readBy
      const readByOthers = message.readBy.filter(id => {
        // Handle both string IDs and object IDs
        if (typeof id === 'string') {
          return id !== user?._id;
        } else if (id._id) {
          return id._id !== user?._id;
        }
        return false;
      });
      
      if (readByOthers.length === 0) {
        return 'Sent';
      } else {
        // For direct messages or when we don't know if it's a group
        return 'Read';
      }
    }
    
    // For messages from others, we don't show read status
    return '';
  };
  
  return (
    <div className={`flex my-2 ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col max-w-[85%] relative">
        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-lg 
            ${isCurrentUserSender 
              ? 'bg-primary-500 text-white rounded-tr-none' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'}
          `}
          onClick={isCurrentUserSender ? toggleActions : undefined}
        >
          {/* Sender name for group chats (only show for messages not from current user) */}
          {!isCurrentUserSender && message.chat?.isGroup && (
            <div className="font-medium text-xs mb-1 text-primary-700 dark:text-primary-300">
              {message.sender?.username || 'Unknown user'}
            </div>
          )}
          
          {/* Message text */}
          <div className="whitespace-pre-wrap break-words">
            {message.text}
          </div>
          
          {/* Message actions menu (only for current user's messages) */}
          {isCurrentUserSender && showActions && (
            <div 
              ref={actionsRef}
              className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 w-32"
            >
              <button
                onClick={handleDelete}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
        
        {/* Message time and read status */}
        <div className={`
          text-xs text-gray-500 mt-1 
          ${isCurrentUserSender ? 'text-right' : 'text-left'}
        `}>
          {timeString}
          {isCurrentUserSender && (
            <span className={`ml-2 flex items-center justify-end ${
              getReadStatus() === 'Read' || getReadStatus() === 'Read by all' 
                ? 'text-green-500' 
                : ''
            }`}>
              <CheckIcon className={`w-3 h-3 mr-1 ${
                getReadStatus() === 'Read' || getReadStatus() === 'Read by all'
                  ? 'text-green-500' 
                  : 'text-gray-500'
              }`} />
              {getReadStatus()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message; 