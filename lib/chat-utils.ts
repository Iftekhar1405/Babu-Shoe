// No complex string formatting functions required
export const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatProductCount = (count: number): string => {
  if (count === 0) return "No products found";
  if (count === 1) return "1 product found";
  return `${count} products found`;
};

// Generate unique message ID
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Extract search intent from user message
export const extractSearchQuery = (message: string): string => {
  // Simple extraction - in a real app, this could use NLP
  const searchTerms = message.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 2)
    .join(' ');
  
  return searchTerms;
};