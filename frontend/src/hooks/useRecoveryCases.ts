import { useState } from "react";
import { api } from "../lib/api";
import type { RecoveryCase } from "../components/types/recovery";

interface RecoveryCaseFilters {
  status?: string;
  problemType?: string;
}

export function useRecoveryCases() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCases = async (filters?: RecoveryCaseFilters): Promise<RecoveryCase[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/recovery-cases", { params: filters });
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recovery cases");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCaseById = async (recoveryCaseId: string): Promise<RecoveryCase | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/recovery-cases/${recoveryCaseId}`);
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recovery case");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getCases, getCaseById, loading, error };
}