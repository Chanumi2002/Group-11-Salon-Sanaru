import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { shopService } from '@/services/shopApi';

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await shopService.getUnreadFeedbackCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Decrement count immediately
  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Increment count
  const incrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Fetch count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <FeedbackContext.Provider
      value={{
        unreadCount,
        fetchUnreadCount,
        decrementUnreadCount,
        incrementUnreadCount,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
