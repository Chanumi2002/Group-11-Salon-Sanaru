/**
 * useAdminNotifications Hook
 * Fetches and manages admin notification counts
 * - Pending appointments awaiting approval
 * - Pending orders awaiting approval
 * 
 * Usage:
 *   const { pendingAppointments, pendingOrders, loading, error, refetch } = useAdminNotifications();
 */
import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/api";

export function useAdminNotifications() {
  const [counts, setCounts] = useState({
    pendingAppointments: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Fetch function - runs on mount and when refetchTrigger changes
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        const [aptRes, ordRes] = await Promise.all([
          adminService.getPendingAppointmentCount(),
          adminService.getPendingOrderCount()
        ]);

        setCounts({
          pendingAppointments: aptRes?.data?.count || 0,
          pendingOrders: ordRes?.data?.count || 0
        });
        
        console.log("Admin notifications updated:", {
          pendingAppointments: aptRes?.data?.count || 0,
          pendingOrders: ordRes?.data?.count || 0
        });
      } catch (err) {
        console.error("Error fetching admin notification counts:", err);
        setError(err?.message || "Failed to fetch notification counts");
        // Set to 0 on error to avoid UI breaking
        setCounts({
          pendingAppointments: 0,
          pendingOrders: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [refetchTrigger]);

  // Refetch function that triggers useEffect by incrementing refetchTrigger
  // Memoized with useCallback to maintain stable reference across renders
  const refetch = useCallback(() => {
    console.log("Refetch triggered for admin notifications");
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    pendingAppointments: counts.pendingAppointments,
    pendingOrders: counts.pendingOrders,
    totalNotifications: counts.pendingAppointments + counts.pendingOrders,
    loading,
    error,
    refetch
  };
}

export default useAdminNotifications;
