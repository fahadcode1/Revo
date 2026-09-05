import { useState } from "react";
import { api } from "../lib/api";
import type { RecoveryActivityEntry } from "../components/types/activity";

export function useRecoveryActivity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActivity = async (): Promise<RecoveryActivityEntry[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/analytics/recovery-activity");
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recovery activity");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getActivity, loading, error };
}