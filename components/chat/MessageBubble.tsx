'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRound, Bot } from 'lucide-react';
import { ChatMessage, MessageType } from '@/types/chat';
import { formatMessageTime } from '@/lib/chat-utils';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/lib/auth-hooks';

interface MessageBubbleProps {
  message: ChatMessage;
  showTimestamp?: boolean;
  onProductSelect?: (product: any) => void;
}

export function MessageBubble({ 
  message, 
  showTimestamp = true,
  onProductSelect 
}: MessageBubbleProps) {
  const { isAuthenticated } = useAuth();
  const isUser = message.type === MessageType.USER;
  const isAI = message.type === MessageType.AI;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-black text-white' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            {isUser ? (
              <UserRound className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'mr-3' : 'ml-3'}`}>
          <Card className={`${
            isUser 
              ? 'bg-black text-white border-black' 
              : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-3">
              <p className={`text-sm ${isUser ? 'text-white' : 'text-gray-900'}`}>
                {message.content}
              </p>
              
              {showTimestamp && (
                <p className={`text-xs mt-2 ${
                  isUser ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {formatMessageTime(message.timestamp)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Product Results */}
          {isAI && message.products && message.products.length > 0 && (
            <div className="mt-4">
              <div className="mb-3">
                <Badge variant="outline" className="text-xs">
                  {message.products.length} product{message.products.length !== 1 ? 's' : ''} found
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {message.products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    showAddToBill={isAuthenticated}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}