import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import MainLayout from '../components/layout/MainLayout';

const ChatSettings = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentChat, getChatById, updateChat, removeParticipant } = useChatStore();
  
  const [formData, setFormData] = useState({
    name: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load chat data
  useEffect(() => {
    const loadChat = async () => {
      const chat = await getChatById(chatId);
      
      if (!chat) {
        navigate('/chats');
        return;
      }
      
      // Only group chats can be edited
      if (!chat.isGroup) {
        navigate(`/chats/${chatId}`);
        return;
      }
      
      // Only creator can edit settings
      if (chat.creator !== user?._id) {
        navigate(`/chats/${chatId}`);
        return;
      }
      
      // Set form data
      setFormData({
        name: chat.name || '',
      });
    };
    
    loadChat();
  }, [chatId, getChatById, navigate, user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await updateChat(chatId, formData);
      navigate(`/chats/${chatId}`);
    } catch (err) {
      setError('Failed to update chat settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveParticipant = async (participantId) => {
    setLoading(true);
    
    try {
      await removeParticipant(chatId, participantId);
    } catch (err) {
      setError('Failed to remove participant');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate(`/chats/${chatId}`);
  };
  
  if (!currentChat) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Settings</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {/* Group Name */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Group Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 input"
                  required
                />
              </div>
              
              {error && (
                <div className="mb-4 text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
          
          {/* Participants */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Participants</h2>
            
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentChat.participants?.map(participant => (
                <li key={participant._id} className="py-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {participant.avatar ? (
                        <img
                          src={participant.avatar}
                          alt={participant.username}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400">
                            {participant.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {participant.username}
                        {participant._id === currentChat.creator && (
                          <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                            (Creator)
                          </span>
                        )}
                        {participant._id === user?._id && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                            (You)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Remove button (not for creator or current user) */}
                  {participant._id !== currentChat.creator && participant._id !== user?._id && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(participant._id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatSettings; 