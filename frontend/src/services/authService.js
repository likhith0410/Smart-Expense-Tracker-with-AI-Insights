// frontend/src/services/authService.js
import api from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', { username: credentials.username });
      const response = await api.post('/auth/login/', credentials);
      const { user, token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Login successful, token stored');
      }
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Login failed';
      
      // Create proper Error object with error property for backwards compatibility
      const authError = new Error(errorMessage);
      authError.error = errorMessage;
      throw authError;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      console.log('Attempting registration with:', { 
        username: userData.username, 
        email: userData.email 
      });
      
      const response = await api.post('/auth/register/', userData);
      const { user, token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Registration successful, token stored');
      }
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Extract specific error messages
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else if (errorData.password_confirm) {
          errorMessage = `Password confirmation: ${errorData.password_confirm[0]}`;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }
      
      // Create proper Error object with error property for backwards compatibility
      const authError = new Error(errorMessage);
      authError.error = errorMessage;
      throw authError;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout/');
      console.log('Logout API call successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Local storage cleared');
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error.response?.data || { error: 'Failed to get profile' };
    }
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};