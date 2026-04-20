/**
 * NotificationContext
 * Manages admin notification badge updates across the app
 * Allows child components to trigger refetch of notification counts
 */
import { createContext, useContext } from "react";

export const NotificationContext = createContext(null);

export function useNotificationRefresh() {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn("useNotificationRefresh must be used within NotificationContext provider");
    return { refetch: () => {} };
  }
  return context;
}
