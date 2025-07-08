import axios from 'axios';

// The address of your Python backend server
const API_BASE_URL = 'http://localhost:8000';

// Create a pre-configured instance of axios for API calls
const apiClient = axios.create({ baseURL: API_BASE_URL });

// Defines the TypeScript type for a single Lead object, including optional AI fields
export interface Lead {
  id: number;
  name: string;
  company: string;
  industry: string;
  size: number;
  source: string;
  created_at: string;
  quality?: string;
  summary?: string;
}

// Function to fetch leads from the backend, accepting an 'enrich' flag
export const getLeads = (params: { 
  enrich: boolean; 
  industry?: string; 
  sizeMin?: number; 
  sizeMax?: number 
}) => {
  return apiClient.get<Lead[]>('/api/leads', { params });
};

// Function to send event tracking data to the backend
export const trackEvent = (action: string, metadata: Record<string, any>) => {
  return apiClient.post('/api/events', { 
    action, 
    metadata, 
    timestamp: new Date().toISOString() 
  });
};
