import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ChatHeader from '../components/chat/ChatHeader';
import Message from '../components/chat/Message';
import MessageInput from '../components/chat/MessageInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import CreateChatModal from '../components/chat/CreateChatModal';
import { useChatStore } from '../store/chatStore';
import { useSocketStore } from '../store/socketStore';
import { useAuthStore } from '../store/authStore';

const ChatView = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentChat, messages, getMessages, sendMessage, deleteMessage, getChatById, clearCurrentChat } = useChatStore();
  const { joinChat, markMessageRead, connected, initSocket, checkConnection } = useSocketStore();
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [socketError, setSocketError] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Check socket connection
  useEffect(() => {
    const checkSocketConnection = () => {
      const isConnected = checkConnection();
      setSocketError(!isConnected);
      
      if (!isConnected) {
        console.log('Socket not connected, attempting to initialize');
        initSocket();
      }
    };
    
    // Check immediately
    checkSocketConnection();
    
    // And periodically
    const interval = setInterval(checkSocketConnection, 10000);
    
    return () => clearInterval(interval);
  }, [checkConnection, initSocket]);
  
  // Get chat and messages on load or when chatId changes
  useEffect(() => {
    const loadChat = async () => {
      try {
        const chat = await getChatById(chatId);
        
        if (chat) {
          // Check if user is a participant in this chat
          const isParticipant = chat.participants.some(
            participant => participant._id === user?._id
          );
          
          if (!isParticipant) {
            setAuthError(true);
            return;
          }
          
          getMessages(chatId);
          
          // Ensure socket is connected before joining chat
          if (connected) {
            console.log(`Joining chat room ${chatId}`);
            joinChat(chatId);
          } else {
            console.warn('Socket not connected, cannot join chat room');
            setSocketError(true);
          }
          
          setAuthError(false);
        } else {
          // Chat not found, redirect to chat list
          navigate('/chats');
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        if (error.response?.status === 403) {
          setAuthError(true);
        } else {
          navigate('/chats');
        }
      }
    };
    
    if (chatId && user?._id) {
      loadChat();
    }
    
    // Clear current chat on unmount
    return () => clearCurrentChat();
  }, [chatId, getChatById, getMessages, joinChat, navigate, clearCurrentChat, user, connected]);
  
  // Join chat when socket connection is established
  useEffect(() => {
    if (connected && chatId && currentChat) {
      console.log(`Socket connected, joining chat ${chatId}`);
      joinChat(chatId);
      setSocketError(false);
    }
  }, [connected, chatId, currentChat, joinChat]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0 && connected) {
      messages.forEach(message => {
        // If message is not from current user and has not been read by current user
        if (message.sender?._id !== user?._id && 
            message.readBy && 
            !message.readBy.includes(user?._id)) {
          markMessageRead(message._id);
        }
      });
    }
  }, [messages, user, markMessageRead, connected]);
  
  // Handle sending a message
  const handleSendMessage = async (text) => {
    if (!connected) {
      console.warn('Socket not connected, cannot send message');
      setSocketError(true);
      return;
    }
    
    try {
      console.log({chatId, text});
      
      await sendMessage(chatId, text);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Handle message deletion
  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId);
  };
  
  // Handle back button (mobile)
  const handleBack = () => {
    navigate('/chats');
  };
  
  // Retry socket connection
  const handleRetryConnection = () => {
    console.log('Manually retrying socket connection');
    initSocket();
    setSocketError(false);
  };
  
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {authError ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-red-500 font-medium text-xl mb-4">Not authorized to view this chat</div>
            <p className="text-gray-500 mb-6">You are not a participant in this conversation.</p>
            <button 
              onClick={() => navigate('/chats')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              style={{ color: 'white !important' }}
            >
              Back to Chats
            </button>
          </div>
        ) : socketError ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-red-500 font-medium text-xl mb-4">Connection Error</div>
            <p className="text-gray-500 mb-6">Unable to connect to chat server. Please check your connection.</p>
            <button 
              onClick={handleRetryConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              style={{ color: 'white !important' }}
            >
              Retry Connection
            </button>
          </div>
        ) : currentChat ? (
          <>
            {/* Chat header */}
            <ChatHeader 
              chat={currentChat} 
              onBack={handleBack} 
              onAddParticipant={() => setIsAddParticipantModalOpen(true)}
            />
            
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  No messages yet. Send the first message!
                </div>
              ) : (
                <>
                  {messages.map(message => (
                    <Message 
                      key={message._id} 
                      message={message} 
                      onDelete={handleDeleteMessage} 
                    />
                  ))}
                  <TypingIndicator chatId={chatId} />
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* Message input */}
            <MessageInput 
              chatId={chatId} 
              onSendMessage={handleSendMessage} 
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>
      
      {/* Add participant modal */}
      <CreateChatModal 
        isOpen={isAddParticipantModalOpen} 
        onClose={() => setIsAddParticipantModalOpen(false)} 
      />
    </MainLayout>
  );
};

export default ChatView; 