import { Product } from './index';

// No specific enums required for this component
export enum MessageType {
  USER = "user",
  AI = "ai",
  SYSTEM = "system"
}

export enum SearchStatus {
  IDLE = "idle",
  SEARCHING = "searching", 
  COMPLETED = "completed",
  ERROR = "error"
}

// Message and chat related types
export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  products?: Product<true>[];
}

export interface SearchState {
  status: SearchStatus;
  query: string;
  isTyping: boolean;
}

// Props types
export interface AIProductSearchProps {
  initialMessages?: ChatMessage[];
  searchState?: SearchState;
  onProductSelect?: (product: Product<true>) => void;
  className?: string;
  config?: {
    maxMessages?: number;
    enableProductSelection?: boolean;
    showTimestamps?: boolean;
    enableClearChat?: boolean;
  };
}

// Store types (if using global state)
export interface ChatStore {
  messages: ChatMessage[];
  searchState: SearchState;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setSearchState: (state: Partial<SearchState>) => void;
}

// Query types (API response data)
export interface SearchResponse {
  products: Product<true>[];
  query: string;
  count: number;
}