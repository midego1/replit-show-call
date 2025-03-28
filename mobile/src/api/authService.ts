import { AxiosResponse } from 'axios';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

// User type definition
export interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
}

// Login request type
export interface LoginRequest {
  username: string;
  password: string;
}

// Register request type
export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  name?: string;
}

// Authentication service
class AuthService {
  // Get current logged in user from API
  async getCurrentUser(): Promise<User | null> {
    try {
      const response: AxiosResponse<User> = await apiClient.get('/user');
      return response.data;
    } catch (error) {
      console.log('Error getting current user:', error);
      return null;
    }
  }

  // Login user with username and password
  async login(credentials: LoginRequest): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiClient.post('/login', credentials);
      
      // For token-based auth, you'd store the token here
      // await AsyncStorage.setItem('authToken', response.data.token);
      
      // Store user info (optional)
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('An error occurred during login. Please try again later.');
      }
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiClient.post('/register', userData);
      
      // For token-based auth, you'd store the token here
      // await AsyncStorage.setItem('authToken', response.data.token);
      
      // Store user info (optional)
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages
      if (error.response?.status === 400 && error.response.data.message.includes('exists')) {
        throw new Error('Username already exists. Please choose a different username.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('An error occurred during registration. Please try again later.');
      }
    }
  }
  
  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
      
      // Clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if the API call fails, still clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      // Only show alert on non-web platforms
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Logout Error',
          'There was a problem logging out from the server, but you have been logged out locally.',
          [{ text: 'OK' }]
        );
      }
    }
  }
  
  // Check if user is authenticated based on stored token or session
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();