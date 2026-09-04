import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import type { Customer } from "../components/types/customer";

interface UseCustomersParams {
  status?: string;
  search?: string;
}

export function useCustomers({ status, search }: UseCustomersParams = {}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/get-customers", {
        params: { status, search },
      });
      setCustomers(res.data.data ?? res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, error, refetch: fetchCustomers };
}