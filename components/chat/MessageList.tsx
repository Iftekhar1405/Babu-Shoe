'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage } from '@/types/chat';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  showTimestamps?: boolean;
  onProductSelect?: (product: any) => void;
  className?: string;
}

export function MessageList({ 
  messages, 
  isTyping = false, 
  showTimestamps = true,
  onProductSelect,
  className 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <ScrollArea className={`flex-1 ${className}`}>
      <div className="p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              AI Product Search
            </h3>
            <p className="text-gray-500 mb-4">
              How can I help you find the perfect product today?
            </p>
            <div className="text-sm text-gray-400">
              <p>Try asking about:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="bg-gray-100 px-3 py-1 rounded-full">Blue shirts</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">Under ₹2000</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">Large size</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">Cotton material</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                showTimestamp={showTimestamps}
                onProductSelect={onProductSelect}
              />
            ))}
            
            {isTyping && <TypingIndicator />}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}