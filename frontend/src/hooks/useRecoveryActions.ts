import { useState } from "react";
import { api } from "../lib/api";
import type { RecoveryCase } from "../components/types/recovery";

interface TriggerRecoveryPayload {
  workflowType: string;
}

interface ResolveIssuePayload {
  resolutionReason: string;
}

export function useRecoveryActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerRecovery = async (
    recoveryCaseId: string,
    payload: TriggerRecoveryPayload
  ): Promise<RecoveryCase | null> => {
    return submit(`/recovery-cases/${recoveryCaseId}/trigger`, payload);
  };

  const stopRecovery = async (recoveryCaseId: string): Promise<RecoveryCase | null> => {
    return submit(`/recovery-cases/${recoveryCaseId}/stop`, {});
  };

  const resumeRecovery = async (recoveryCaseId: string): Promise<RecoveryCase | null> => {
    return submit(`/recovery-cases/${recoveryCaseId}/resume`, {});
  };

  const resolveIssue = async (
    recoveryCaseId: string,
    payload: ResolveIssuePayload
  ): Promise<RecoveryCase | null> => {
    return submit(`/recovery-cases/${recoveryCaseId}/resolve-issue`, payload);
  };

  const submit = async (url: string, payload: unknown): Promise<RecoveryCase | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, payload);
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recovery action failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { triggerRecovery, stopRecovery, resumeRecovery, resolveIssue, loading, error };
}