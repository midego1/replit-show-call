import axios from 'axios';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API requests
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development environment
  : 'https://show-caller.replit.app/api';  // Production environment

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Important for cookies and authentication
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token (if you implement token refresh)
        // const refreshResponse = await apiClient.post('/refresh-token');
        // await AsyncStorage.setItem('authToken', refreshResponse.data.token);
        // originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
        // return apiClient(originalRequest);
        
        // For now, just clear the token and return the error
        await AsyncStorage.removeItem('authToken');
        
        // Show alert only in development
        if (__DEV__) {
          Alert.alert(
            'Session Expired',
            'Please log in again to continue.',
            [{ text: 'OK' }]
          );
        }
      } catch (refreshError) {
        await AsyncStorage.removeItem('authToken');
        return Promise.reject(refreshError);
      }
    }
    
    // General error handling
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Error:', error.response.status, error.response.data);
      
      // Custom error handling based on status codes
      switch (error.response.status) {
        case 400:
          // Bad request - likely validation error
          const errorMessage = error.response.data.message || 'Invalid request';
          console.error('Validation Error:', errorMessage);
          break;
        case 404:
          // Resource not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error('Network Error:', error.request);
      
      // Network connectivity issue
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Error in setting up the request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);