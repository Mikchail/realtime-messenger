import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSocketStore } from '../../store/socketStore';
import { 
  UserIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { disconnect } = useSocketStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const handleLogout = () => {
    // Disconnect socket
    disconnect();
    // Logout user
    logout();
    // Navigate to login
    navigate('/login');
  };
  
  const navigation = [
    { name: 'Chats', href: '/chats', icon: ChatBubbleLeftRightIcon, active: location.pathname.startsWith('/chats') },
    { name: 'Profile', href: '/profile', icon: UserIcon, active: location.pathname === '/profile' }
  ];
  
  return (
    <div className="h-full flex">
      {/* Mobile menu */}
      <div className="lg:hidden">
        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
        ) : null}
        
        <button
          type="button"
          className="fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open menu</span>
          {mobileMenuOpen ? (
            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
        </button>
        
        <div
          className={`fixed inset-y-0 left-0 flex flex-col z-40 w-64 transform transition ease-in-out duration-300 bg-white dark:bg-gray-800 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* User info in mobile menu */}
            <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{user?.username || 'User'}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</div>
                </div>
              </div>
            </div>
            
            {/* Navigation in mobile menu */}
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    item.active
                      ? 'bg-primary-100 text-gray-500 dark:bg-primary-200 dark:text-primary-800'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 ${
                      item.active
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              
              {/* Logout in mobile menu */}
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <ArrowRightOnRectangleIcon
                  className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                  aria-hidden="true"
                />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* User info in desktop sidebar */}
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{user?.username || 'User'}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</div>
                </div>
              </div>
            </div>
            
            {/* Navigation in desktop sidebar */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      item.active
                        ? 'bg-primary-100 text-gray-500 dark:bg-primary-900 dark:text-primary-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        item.active
                          ? 'text-gray-500 dark:text-primary-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Logout in desktop sidebar */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <ArrowRightOnRectangleIcon
                  className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                  aria-hidden="true"
                />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 