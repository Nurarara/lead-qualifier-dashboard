import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

export interface Lead {
  id: number;
  name: string;
  company: string;
  industry: string;
  size: number;
  source: string;
  created_at: string;
}

export const getLeads = (params: { 
  industry?: string; 
  sizeMin?: number; 
  sizeMax?: number 
}) => {
  return apiClient.get<Lead[]>('/api/leads', { params });
};

export const trackEvent = (action: string, metadata: Record<string, any>) => {
  return apiClient.post('/api/events', { 
    action, 
    metadata, 
    timestamp: new Date().toISOString() 
  });
};

// --- NEW askAI function ---
export const askAI = async (question: string, leads: Lead[]) => {
  const response = await apiClient.post<{ answer: string }>('/api/ask', { question, leads });
  return response.data;
};