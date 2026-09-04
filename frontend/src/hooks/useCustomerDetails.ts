import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import type { Customer } from "../components/types/customer";

export function useCustomerDetails(customerId: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/get-customer-detail", {
        params: { customerId },
      });
      setCustomer(res.data.data ?? res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customer");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { customer, loading, error, refetch: fetchDetails };
}