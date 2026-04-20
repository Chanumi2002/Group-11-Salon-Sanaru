/**
 * useCustomerAppointments Hook
 * Fetches and manages customer appointment status counts
 * - Pending: awaiting admin approval
 * - Confirmed: approved & upcoming
 * - Cancelled
 * - Rejected
 * 
 * Usage:
 *   const { pending, confirmed, cancelled, rejected, loading, error, refetch } = useCustomerAppointments();
 */
import { useEffect, useState, useCallback } from "react";
import { customerService } from "@/services/api";

export function useCustomerAppointments() {
  const [counts, setCounts] = useState({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerService.getAppointmentStatusCounts();
      
      setCounts({
        pending: response?.data?.pending || 0,
        confirmed: response?.data?.confirmed || 0,
        cancelled: response?.data?.cancelled || 0,
        rejected: response?.data?.rejected || 0
      });
    } catch (err) {
      console.error("Error fetching customer appointment counts:", err);
      setError(err?.message || "Failed to fetch appointment counts");
      // Set to 0 on error
      setCounts({
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        rejected: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    pending: counts.pending,
    confirmed: counts.confirmed,
    cancelled: counts.cancelled,
    rejected: counts.rejected,
    total: Object.values(counts).reduce((a, b) => a + b, 0),
    upcomingCount: counts.pending + counts.confirmed,
    loading,
    error,
    refetch: fetchCounts
  };
}

export default useCustomerAppointments;
