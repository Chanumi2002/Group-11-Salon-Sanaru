import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { shopService } from '@/services/shopApi';
import { getStoredRole, getStoredToken } from '@/utils/authState';

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count (only for authenticated admins)
  const fetchUnreadCount = useCallback(async () => {
    try {
      // Only fetch if user is authenticated and is an admin
      const token = getStoredToken();
      const role = getStoredRole();
      
      if (!token || role !== 'ADMIN') {
        setUnreadCount(0);
        return;
      }

      const data = await shopService.getUnreadFeedbackCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      // Only log for non-401 errors
      if (error.response?.status !== 401) {
        console.error('Error fetching unread count:', error);
      }
      setUnreadCount(0);
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

  // Fetch count on mount and when auth state changes
  useEffect(() => {
    const token = getStoredToken();
    const role = getStoredRole();
    
    if (token && role === 'ADMIN') {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
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
