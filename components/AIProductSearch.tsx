'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageList } from './chat/MessageList';
import { ChatInput } from './chat/ChatInput';
import { AIProductSearchProps } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

export function AIProductSearch({
  initialMessages = [],
  className,
  config = {},
  onProductSelect
}: AIProductSearchProps) {
  const {
    maxMessages = 50,
    showTimestamps = true,
    enableClearChat = true,
  } = config;

  const {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
  } = useChat({
    initialMessages,
    maxMessages,
  });

  return (
    <div className={cn("flex flex-col h-full h-[100vh] overflow-auto", className)}>
      <Card className="flex-1 flex flex-col">
        {/* Header */}
        <CardHeader className="border-b border-gray-200 bg-white rounded-t-lg">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span>AI Product Search</span>
          </CardTitle>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <MessageList
            messages={messages}
            isTyping={isTyping}
            showTimestamps={showTimestamps}
            onProductSelect={onProductSelect}
            className="h-full"
          />
        </CardContent>

        {/* Input Area */}
        <div className="border-t sticky bottom-0 border-gray-200">
          <ChatInput
            onSendMessage={sendMessage}
            onClearChat={enableClearChat ? clearMessages : () => { }}
            disabled={isTyping}
            placeholder="Ask me anything about our products..."
          />
        </div>
      </Card>
    </div>
  );
}