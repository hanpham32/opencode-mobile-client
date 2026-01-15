import axios from 'axios';
import { Session, SessionMessageResponse, Provider } from '../types/chat';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4096';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSessions = async (): Promise<Session[]> => {
  const response = await api.get('/session');
  return response.data;
};

export const getSession = async (sessionId: string): Promise<Session> => {
  const response = await api.get(`/session/${sessionId}`);
  return response.data;
};

export const createSession = async (title?: string): Promise<Session> => {
  const response = await api.post('/session', { title });
  return response.data;
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
  const response = await api.delete(`/session/${sessionId}`);
  return response.data;
};

export const getSessionMessages = async (sessionId: string): Promise<SessionMessageResponse[]> => {
  const response = await api.get(`/session/${sessionId}/message`);
  return response.data;
};

export const sendMessage = async (
  sessionId: string,
  content: string,
  modelId?: string,
  providerId?: string
): Promise<SessionMessageResponse> => {
  const body: {
    parts: Array<{ type: string; text: string }>;
    model?: { id: string; providerID: string; modelID: string };
  } = {
    parts: [{ type: 'text', text: content }],
  };
  if (modelId && providerId) {
    body.model = {
      id: modelId,
      providerID: providerId,
      modelID: modelId,
    };
  }
  const response = await api.post(`/session/${sessionId}/message`, body);
  return response.data;
};

export const getProviders = async (): Promise<Provider[]> => {
  const response = await api.get('/provider');
  return response.data.all;
};

export default api;
