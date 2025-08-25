'use client';

import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center space-x-3 p-4 ${className}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      
      <div className="flex-1">
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          <div className="flex items-center space-x-1">
            <span>AI is typing</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </Badge>
      </div>
    </div>
  );
}