import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useSocketStore } from '../../store/socketStore';

const MessageInput = ({ chatId, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { sendTyping, connected } = useSocketStore();
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);
  
  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatId]);
  
  // Handle typing events
  const handleTyping = () => {
    if (!connected) return;
    
    clearTimeout(typingTimeout.current);
    
    // Send typing indicator
    sendTyping(chatId, true);
    
    // Set timeout to stop typing indicator after 3 seconds of inactivity
    typingTimeout.current = setTimeout(() => {
      sendTyping(chatId, false);
    }, 3000);
  };
  
  // Handle input change
  const handleChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
  };
  
  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;
    
    try {
      setIsSending(true);
      
      // Send the message
      await onSendMessage(trimmedMessage);
      
      // Clear the input
      setMessage('');
      
      // Stop typing indicator
      if (connected) {
        sendTyping(chatId, false);
      }
      clearTimeout(typingTimeout.current);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
      
      // Focus the input again
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  // Handle enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Clean up typing indicator when component unmounts
  useEffect(() => {
    return () => {
      if (connected) {
        sendTyping(chatId, false);
      }
      clearTimeout(typingTimeout.current);
    };
  }, [chatId, connected, sendTyping]);
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700"
    >
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isSending || !connected}
          className={`w-full py-2 px-4 outline-none border border-gray-300 dark:border-gray-600 rounded-full resize-none overflow-hidden bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            !connected ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ maxHeight: '120px', minHeight: '40px' }}
          rows={Math.min(Math.max(message.split('\n').length, 1), 4)}
        />
      </div>
      
      <button
        type="submit"
        disabled={!message.trim() || isSending || !connected}
        className={`ml-2 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          message.trim() && !isSending && connected
            ? 'bg-primary-500 text-white hover:bg-primary-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700'
        }`}
      >
        {isSending ? (
          <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
        ) : (
          <PaperAirplaneIcon className="h-5 w-5" />
        )}
      </button>
    </form>
  );
};

export default MessageInput; 