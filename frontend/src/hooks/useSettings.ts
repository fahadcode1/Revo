import { useState } from "react";
import { api } from "../lib/api";
import type { Settings } from "../components/types/settings";

export function useSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSettings = async (): Promise<Settings | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/settings");
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const setEngineStatus = async (enabled: boolean): Promise<Settings | null> => {
    return submit("/set-engine-status", { enabled });
  };

  const setAiStatus = async (enabled: boolean): Promise<Settings | null> => {
    return submit("/set-ai-status", { enabled });
  };

  const submit = async (url: string, payload: unknown): Promise<Settings | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, payload);
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update setting");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getSettings, setEngineStatus, setAiStatus, loading, error };
}