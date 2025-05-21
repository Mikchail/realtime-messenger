import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import MainLayout from '../components/layout/MainLayout';
import ChatItem from '../components/chat/ChatItem';
import CreateChatModal from '../components/chat/CreateChatModal';
import { useChatStore } from '../store/chatStore';

const ChatList = () => {
  const navigate = useNavigate();
  const { chats, getChats, loading, unreadCounts } = useChatStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  useEffect(() => {
    getChats();
  }, [getChats]);
  
  const handleChatSelect = (chatId) => {
    navigate(`/chats/${chatId}`);
  };
  
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading && chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No conversations yet
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {chats.map(chat => (
                <div key={chat._id} onClick={() => handleChatSelect(chat._id)}>
                  <ChatItem 
                    chat={chat} 
                    unreadCount={unreadCounts[chat._id] || 0} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <CreateChatModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </MainLayout>
  );
};

export default ChatList;