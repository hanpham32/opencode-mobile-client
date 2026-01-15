export interface Session {
  id: string;
  slug: string;
  version: string;
  projectID: string;
  directory: string;
  title: string | null;
  time: {
    created: number;
    updated: number;
  };
}

export interface MessagePart {
  id: string;
  sessionID: string;
  messageID: string;
  type: 'text' | 'reasoning' | 'step-start' | 'step-finish' | 'image' | 'tool-call' | 'tool-result';
  text?: string;
  metadata?: Record<string, unknown>;
  time?: {
    start: number;
    end: number;
  };
}

export interface Message {
  id: string;
  sessionID: string;
  role: 'user' | 'assistant' | 'system';
  time: {
    created: number;
    completed?: number;
  };
  parentID?: string;
  modelID?: string;
  providerID?: string;
  mode?: string;
  agent?: string;
  path?: {
    cwd: string;
    root: string;
  };
  cost?: number;
  tokens?: {
    input: number;
    output: number;
    reasoning: number;
    cache: {
      read: number;
      write: number;
    };
  };
  finish?: string;
}

export interface SessionMessageResponse {
  info: Message;
  parts: MessagePart[];
}

export interface ChatState {
  messages: SessionMessageResponse[];
  isLoading: boolean;
  error: string | null;
  currentSession: Session | null;
  sessions: Session[];
}
