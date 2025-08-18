'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, MessageType, SearchStatus } from '@/types/chat';
import { generateMessageId, extractSearchQuery } from '@/lib/chat-utils';
import { useProductSearch } from '@/lib/api-advance';
import { useDebounce } from './use-debounce';

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  maxMessages?: number;
}

export function useChat({ initialMessages = [], maxMessages = 50 }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [pendingUserMessage, setPendingUserMessage] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedQuery = useDebounce(currentQuery, 300);
  
  // Use existing product search hook
  const { 
    data: searchResults, 
    isLoading: isSearching, 
    error: searchError 
  } = useProductSearch(debouncedQuery);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date(),
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Keep only the last maxMessages
      return updated.slice(-maxMessages);
    });

    return newMessage;
  }, [maxMessages]);

  // Effect to handle search results and generate AI response
  useEffect(() => {
    if (!pendingUserMessage || !currentQuery || isSearching) {
      return;
    }

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a timeout to generate AI response after search is complete
    searchTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      
      // Generate AI response based on current search results
      const hasResults = searchResults && searchResults.length > 0;
      
      addMessage({
        type: MessageType.AI,
        content: hasResults 
          ? `I found ${searchResults.length} product${searchResults.length !== 1 ? 's' : ''} for you. Here are the best matches:`
          : `I couldn't find any products matching "${pendingUserMessage}". Try asking about specific product features, categories, or brands.`,
        products: searchResults || [],
      });

      // Clear pending message
      setPendingUserMessage('');
    }, 800); // Shorter delay since search is already complete

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchResults, isSearching, currentQuery, pendingUserMessage, addMessage]);

  const sendUserMessage = useCallback(async (content: string) => {
    // Add user message immediately
    addMessage({
      type: MessageType.USER,
      content,
    });

    // Extract search query
    const searchQuery = extractSearchQuery(content);
    
    if (searchQuery) {
      // Set typing indicator and start search
      setIsTyping(true);
      setPendingUserMessage(content);
      setCurrentQuery(searchQuery);
    } else {
      // Handle non-search messages
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage({
          type: MessageType.AI,
          content: "I'd be happy to help you find products! Try asking about specific items, categories, brands, or features you're looking for.",
        });
      }, 1000);
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentQuery('');
    setPendingUserMessage('');
    setIsTyping(false);
    
    // Clear any pending timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  const searchState = {
    status: isSearching ? SearchStatus.SEARCHING : SearchStatus.IDLE,
    query: currentQuery,
    isTyping: isTyping || isSearching,
  };

  return {
    messages,
    isTyping: isTyping || isSearching,
    searchState,
    sendMessage: sendUserMessage,
    clearMessages,
    addMessage,
  };
}