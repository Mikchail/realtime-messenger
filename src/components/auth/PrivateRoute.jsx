import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useSocketStore } from '../../store/socketStore';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, token, checkAuth } = useAuthStore();
  const { initSocket } = useSocketStore();
  
  useEffect(() => {
    const authenticate = async () => {
      // Only check auth if token exists but user is not logged in
      if (token && !isLoggedIn) {
        await checkAuth();
      }
    };
    
    authenticate();
  }, [token, isLoggedIn, checkAuth]);
  
  useEffect(() => {
    // Initialize socket connection when user is logged in
    if (isLoggedIn) {
      initSocket();
    }
  }, [isLoggedIn, initSocket]);
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // If we have a token but checking authentication status
  if (token && !isLoggedIn) {
    // You could show a loading spinner here
    return <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute; 