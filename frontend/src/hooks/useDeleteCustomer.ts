import { useState } from "react";
import { api } from "../lib/api";

export function useDeleteCustomer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCustomer = async (customerId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete("/delete-customer", { params: { customerId } });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCustomer, loading, error };
}