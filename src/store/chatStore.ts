import { create } from 'zustand';
import { SessionMessageResponse, ChatState, Session, Provider, Model } from '../types/chat';
import { ThemeMode } from '../theme';

interface ChatStore extends ChatState {
  providers: Provider[];
  selectedProvider: Provider | null;
  selectedModel: Model | null;
  defaultModel: Model | null;
  theme: ThemeMode;
  addMessage: (message: SessionMessageResponse) => void;
  setMessages: (messages: SessionMessageResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  setCurrentSession: (session: Session | null) => void;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;
  setProviders: (providers: Provider[]) => void;
  setSelectedProvider: (provider: Provider | null) => void;
  setSelectedModel: (model: Model | null) => void;
  setDefaultModel: (model: Model | null) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  currentSession: null,
  sessions: [],
  providers: [],
  selectedProvider: null,
  selectedModel: null,
  defaultModel: null,
  theme: 'light',

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) => set({ messages }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [], error: null }),

  setCurrentSession: (session) => set({ currentSession: session }),

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),

  removeSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    })),

  setProviders: (providers) => set({ providers }),

  setSelectedProvider: (provider) => set({ selectedProvider: provider }),

  setSelectedModel: (model) => set({ selectedModel: model }),

  setDefaultModel: (model) => set({ defaultModel: model }),

  setTheme: (theme) => set({ theme }),

  toggleTheme: () => {
    const current = get().theme;
    set({ theme: current === 'light' ? 'dark' : 'light' });
  },
}));
