/**
 * useCustomerOrders Hook
 * Fetches and manages customer order status counts
 * - Pending: awaiting confirmation
 * - Confirmed: confirmed orders
 * - Paid: payment completed
 * - Cancelled
 * 
 * Usage:
 *   const { pending, confirmed, paid, cancelled, loading, error, refetch } = useCustomerOrders();
 */
import { useEffect, useState, useCallback } from "react";
import { customerService } from "@/services/api";

export function useCustomerOrders() {
  const [counts, setCounts] = useState({
    pending: 0,
    confirmed: 0,
    paid: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerService.getOrderStatusCounts();
      
      setCounts({
        pending: response?.data?.pending || 0,
        confirmed: response?.data?.confirmed || 0,
        paid: response?.data?.paid || 0,
        cancelled: response?.data?.cancelled || 0
      });
    } catch (err) {
      console.error("Error fetching customer order counts:", err);
      setError(err?.message || "Failed to fetch order counts");
      // Set to 0 on error
      setCounts({
        pending: 0,
        confirmed: 0,
        paid: 0,
        cancelled: 0
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
    paid: counts.paid,
    cancelled: counts.cancelled,
    total: Object.values(counts).reduce((a, b) => a + b, 0),
    activeCount: counts.pending + counts.confirmed + counts.paid,
    loading,
    error,
    refetch: fetchCounts
  };
}

export default useCustomerOrders;
