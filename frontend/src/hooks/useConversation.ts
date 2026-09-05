import { useState } from "react";
import { api } from "../lib/api";
import type { Message, ReplyAsCustomerResponse } from "../components/types/conversation";

export function useConversation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMessages = async (recoveryCaseId: string): Promise<Message[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/recovery-cases/${recoveryCaseId}/conversation`);
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch conversation");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const replyAsCustomer = async (
    recoveryCaseId: string,
    payload: { customerId: string; content: string; channel?: string }
  ): Promise<ReplyAsCustomerResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(
        `/recovery-cases/${recoveryCaseId}/conversation/reply`,
        payload
      );
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getMessages, replyAsCustomer, loading, error };
}