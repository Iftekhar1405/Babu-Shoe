'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SendHorizontal, Trash } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  onClearChat,
  disabled = false,
  placeholder = "Ask me anything about our products..."
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="border-t border-gray-200 rounded-none bg-white">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClearChat}
            className="text-gray-500 hover:text-gray-700"
            title="Clear chat"
          >
            <Trash className="w-4 h-4" />
          </Button>

          <form className="flex-1" onSubmit={handleSubmit}>
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 border-gray-300 focus:border-gray-400"
                autoFocus
              />

              <Button
                type="submit"
                disabled={!message.trim() || disabled}
                className="bg-black hover:bg-gray-800 text-white px-4"
              >
                <SendHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          <p>You can ask me about:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="bg-gray-100 px-2 py-1 rounded">Product categories</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Specific brands</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Price ranges</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Size availability</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}