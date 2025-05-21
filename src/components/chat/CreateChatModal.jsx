import { Fragment, useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useUserStore } from '../../store/userStore';
import { useChatStore } from '../../store/chatStore';
import { useNavigate } from 'react-router-dom';

const CreateChatModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { searchUsers, searchResults, clearSearchResults } = useUserStore();
  const { createChat, loading } = useChatStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [chatType, setChatType] = useState('direct'); // 'direct' or 'group'
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Clear search results when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearSearchResults();
      setSearchTerm('');
      setChatType('direct');
      setGroupName('');
      setSelectedUsers([]);
      setErrors({});
    }
  }, [isOpen, clearSearchResults]);
  
  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    
    if (e.target.value.trim().length >= 2) {
      searchUsers(e.target.value);
    } else {
      clearSearchResults();
    }
  };
  
  // Handle user selection
  const handleUserSelect = (user) => {
    if (chatType === 'direct') {
      setSelectedUsers([user]);
    } else {
      // Check if user is already selected
      const isSelected = selectedUsers.some(selected => selected._id === user._id);
      
      if (isSelected) {
        setSelectedUsers(selectedUsers.filter(selected => selected._id !== user._id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
    
    // Clear any errors
    setErrors({});
  };
  
  // Handle chat type change
  const handleChatTypeChange = (type) => {
    setChatType(type);
    setSelectedUsers([]);
    setErrors({});
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (chatType === 'group' && !groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    }
    
    if (selectedUsers.length === 0) {
      newErrors.users = 'Select at least one user';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // Create chat data
      const chatData = {
        isGroup: chatType === 'group',
        participants: selectedUsers.map(user => user._id)
      };
      
      // Add group name if group chat
      if (chatType === 'group') {
        chatData.name = groupName.trim();
      }
      
      // Create chat
      const chat = await createChat(chatData);
      
      // Close modal
      onClose();
      
      // Navigate to the new chat
      if (chat) {
        navigate(`/chats/${chat._id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50" />
        
        <DialogPanel className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-xl p-6 shadow-xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <DialogTitle as="h3" className="text-xl font-semibold text-gray-900 dark:text-white" style={{ color: '#111827 !important', fontSize: '1.25rem !important' }}>
              New Chat
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              style={{ color: '#9CA3AF !important' }}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Chat type selector */}
          <div className="flex space-x-2 mb-6">
            <button
              type="button"
              onClick={() => handleChatTypeChange('direct')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center text-sm font-medium ${
                chatType === 'direct' 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
              style={{ color: chatType === 'direct' ? '#1D4ED8 !important' : '#374151 !important', fontSize: '0.875rem !important' }}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" style={{ color: 'inherit !important' }} />
              Direct Chat
            </button>
            <button
              type="button"
              onClick={() => handleChatTypeChange('group')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center text-sm font-medium ${
                chatType === 'group' 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
              style={{ color: chatType === 'group' ? '#1D4ED8 !important' : '#374151 !important', fontSize: '0.875rem !important' }}
            >
              <UserGroupIcon className="w-5 h-5 mr-2" style={{ color: 'inherit !important' }} />
              Group Chat
            </button>
          </div>
          
          {/* Group name input (only for group chats) */}
          {chatType === 'group' && (
            <div className="mb-4">
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1" style={{ color: '#374151 !important', fontSize: '0.875rem !important' }}>
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.groupName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter group name"
                style={{ color: '#111827 !important', fontSize: '1rem !important', backgroundColor: 'white' }}
              />
              {errors.groupName && (
                <p className="mt-1 text-sm text-red-600" style={{ color: '#DC2626 !important', fontSize: '0.875rem !important' }}>{errors.groupName}</p>
              )}
            </div>
          )}
          
          {/* User search input */}
          <div className="mb-4">
            <label htmlFor="searchUsers" className="block text-sm font-medium text-gray-700 mb-1" style={{ color: '#374151 !important', fontSize: '0.875rem !important' }}>
              {chatType === 'direct' ? 'Find User' : 'Add Participants'}
            </label>
            <div className="relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" style={{ color: '#9CA3AF !important' }} />
              </div>
              <input
                type="text"
                id="searchUsers"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by username or email"
                style={{ color: '#111827 !important', fontSize: '1rem !important', backgroundColor: 'white' }}
              />
            </div>
            {errors.users && (
              <p className="mt-1 text-sm text-red-600" style={{ color: '#DC2626 !important', fontSize: '0.875rem !important' }}>{errors.users}</p>
            )}
          </div>
          
          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151 !important', fontSize: '0.875rem !important' }}>
                {chatType === 'direct' ? 'Selected User' : 'Selected Participants'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user._id}
                    className="flex items-center bg-blue-100 px-3 py-1 rounded-full"
                  >
                    <span style={{ color: '#1D4ED8 !important', fontSize: '0.875rem !important' }}>{user.username}</span>
                    <button 
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className="ml-1 p-1 rounded-full hover:bg-blue-200"
                    >
                      <XMarkIcon className="h-4 w-4" style={{ color: '#1D4ED8 !important' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 p-2 border-b border-gray-200" style={{ color: '#374151 !important', fontSize: '0.875rem !important' }}>
                Search Results
              </h4>
              <ul className="divide-y divide-gray-200">
                {searchResults.map(user => {
                  const isSelected = selectedUsers.some(selected => selected._id === user._id);
                  return (
                    <li 
                      key={user._id}
                      className={`p-3 flex items-center cursor-pointer hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <span style={{ color: '#6B7280 !important', fontSize: '1rem !important' }}>
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium" style={{ color: '#111827 !important', fontSize: '0.875rem !important' }}>
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500" style={{ color: '#6B7280 !important', fontSize: '0.75rem !important' }}>
                          {user.email}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="ml-auto">
                          <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3" style={{ color: 'white !important' }}>
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {/* Footer buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              style={{ color: '#374151 !important', fontSize: '0.875rem !important' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleSubmit}
              disabled={loading}
              style={{ color: 'white !important', fontSize: '0.875rem !important' }}
            >
              {loading ? 'Creating...' : 'Create Chat'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default CreateChatModal; 