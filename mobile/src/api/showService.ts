import { AxiosResponse } from 'axios';
import { apiClient } from './apiClient';

// Show type definition
export interface Show {
  id: number;
  userId: number;
  title: string;
  venue?: string;
  date: string;
}

// Call type definition
export interface Call {
  id: number;
  showId: number;
  subject: string;
  description?: string;
  minutesBefore: number;
  sendNotification: boolean;
}

// Create show request
export interface CreateShowRequest {
  title: string;
  venue?: string;
  date: string;
}

// Update show request
export interface UpdateShowRequest {
  title?: string;
  venue?: string;
  date?: string;
}

// Create call request
export interface CreateCallRequest {
  showId: number;
  subject: string;
  description?: string;
  minutesBefore: number;
  sendNotification: boolean;
}

// Update call request
export interface UpdateCallRequest {
  subject?: string;
  description?: string;
  minutesBefore?: number;
  sendNotification?: boolean;
}

// Show service with CRUD operations
class ShowService {
  // Get all shows for the logged in user
  async getShows(): Promise<Show[]> {
    try {
      const response: AxiosResponse<Show[]> = await apiClient.get('/shows');
      return response.data;
    } catch (error) {
      console.error('Error fetching shows:', error);
      throw new Error('Failed to fetch shows. Please try again later.');
    }
  }

  // Get a single show by ID
  async getShow(id: number): Promise<Show> {
    try {
      const response: AxiosResponse<Show> = await apiClient.get(`/shows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching show with ID ${id}:`, error);
      throw new Error('Failed to fetch show details. Please try again later.');
    }
  }

  // Create a new show
  async createShow(showData: CreateShowRequest): Promise<Show> {
    try {
      const response: AxiosResponse<Show> = await apiClient.post('/shows', showData);
      return response.data;
    } catch (error) {
      console.error('Error creating show:', error);
      throw new Error('Failed to create show. Please try again later.');
    }
  }

  // Update an existing show
  async updateShow(id: number, showData: UpdateShowRequest): Promise<Show> {
    try {
      const response: AxiosResponse<Show> = await apiClient.patch(`/shows/${id}`, showData);
      return response.data;
    } catch (error) {
      console.error(`Error updating show with ID ${id}:`, error);
      throw new Error('Failed to update show. Please try again later.');
    }
  }

  // Delete a show
  async deleteShow(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/shows/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting show with ID ${id}:`, error);
      throw new Error('Failed to delete show. Please try again later.');
    }
  }

  // Get all calls for a show
  async getCalls(showId: number): Promise<Call[]> {
    try {
      const response: AxiosResponse<Call[]> = await apiClient.get(`/shows/${showId}/calls`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching calls for show with ID ${showId}:`, error);
      throw new Error('Failed to fetch calls. Please try again later.');
    }
  }

  // Get a single call by ID
  async getCall(callId: number): Promise<Call> {
    try {
      const response: AxiosResponse<Call> = await apiClient.get(`/calls/${callId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching call with ID ${callId}:`, error);
      throw new Error('Failed to fetch call details. Please try again later.');
    }
  }

  // Create a new call for a show
  async createCall(callData: CreateCallRequest): Promise<Call> {
    try {
      const response: AxiosResponse<Call> = await apiClient.post('/calls', callData);
      return response.data;
    } catch (error) {
      console.error('Error creating call:', error);
      throw new Error('Failed to create call. Please try again later.');
    }
  }

  // Update an existing call
  async updateCall(callId: number, callData: UpdateCallRequest): Promise<Call> {
    try {
      const response: AxiosResponse<Call> = await apiClient.patch(`/calls/${callId}`, callData);
      return response.data;
    } catch (error) {
      console.error(`Error updating call with ID ${callId}:`, error);
      throw new Error('Failed to update call. Please try again later.');
    }
  }

  // Delete a call
  async deleteCall(callId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/calls/${callId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting call with ID ${callId}:`, error);
      throw new Error('Failed to delete call. Please try again later.');
    }
  }
}

export const showService = new ShowService();