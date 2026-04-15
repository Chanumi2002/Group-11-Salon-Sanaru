import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { shopService } from '@/services/shopApi';
import { getStoredRole, getStoredToken } from '@/utils/authState';

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
  const [unapprovedCount, setUnapprovedCount] = useState(0);

  // Fetch unapproved count (only for authenticated admins)
  const fetchUnapprovedCount = useCallback(async () => {
    try {
      // Only fetch if user is authenticated and is an admin
      const token = getStoredToken();
      const role = getStoredRole();
      
      if (!token || role !== 'ADMIN') {
        setUnapprovedCount(0);
        return;
      }

      const data = await shopService.getUnapprovedFeedbackCount();
      setUnapprovedCount(data.unapprovedCount || 0);
    } catch (error) {
      // Only log for non-401 errors
      if (error.response?.status !== 401) {
        console.error('Error fetching unapproved count:', error);
      }
      setUnapprovedCount(0);
    }
  }, []);

  // Decrement count immediately
  const decrementUnapprovedCount = useCallback(() => {
    setUnapprovedCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Increment count
  const incrementUnapprovedCount = useCallback(() => {
    setUnapprovedCount((prev) => prev + 1);
  }, []);

  // Fetch count on mount and when auth state changes
  useEffect(() => {
    const token = getStoredToken();
    const role = getStoredRole();
    
    if (token && role === 'ADMIN') {
      fetchUnapprovedCount();
    } else {
      setUnapprovedCount(0);
    }
  }, [fetchUnapprovedCount]);

  return (
    <FeedbackContext.Provider
      value={{
        unapprovedCount,
        fetchUnapprovedCount,
        decrementUnapprovedCount,
        incrementUnapprovedCount,
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
