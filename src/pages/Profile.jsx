import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { validateForm } from '../utils/validation';
import MainLayout from '../components/layout/MainLayout';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, loading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Set initial form data from user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear success message when making changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const schema = {
      username: { 
        required: true,
        minLength: 3,
        maxLength: 20,
        isUsername: true,
        label: 'Username'
      },
      email: { 
        required: true, 
        isEmail: true,
        label: 'Email'
      }
    };
    
    // Only validate password if it's provided
    if (formData.password) {
      schema.password = { 
        minLength: 8,
        isStrongPassword: true,
        label: 'Password'
      };
      
      schema.confirmPassword = {
        match: 'password',
        matchLabel: 'password',
        label: 'Confirm Password'
      };
    }
    
    const { isValid, errors } = validateForm(formData, schema);
    
    if (!isValid) {
      setFormErrors(errors);
      return;
    }
    
    // Prepare update data (omit confirmPassword and empty password)
    const updateData = {
      username: formData.username,
      email: formData.email
    };
    
    if (formData.password) {
      updateData.password = formData.password;
    }
    
    // Submit the form
    const success = await updateProfile(updateData);
    if (success) {
      setSuccessMessage('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Profile</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-3 rounded-md">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`input ${formErrors.username ? 'border-red-500' : ''}`}
                />
                {formErrors.username && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${formErrors.email ? 'border-red-500' : ''}`}
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Leave blank if you don't want to change your password
              </p>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input ${formErrors.password ? 'border-red-500' : ''}`}
                  />
                  {formErrors.password && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile; 