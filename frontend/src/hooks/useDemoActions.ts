import { useState } from "react";
import { api } from "../lib/api";

export function useDemoActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulatePaymentFailure = async (payload: { paymentId: string; failureReason: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/simulate-payment-failure", payload);
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to simulate payment failure");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async (paymentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/simulate-payment-success", { paymentId });
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to simulate payment success");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { simulatePaymentFailure, simulatePaymentSuccess, loading, error };
}