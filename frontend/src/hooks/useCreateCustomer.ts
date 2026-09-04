import { useState } from "react";
import { api } from "../lib/api";
import type { Customer } from "../components/types/customer";

interface BasePayload {
  fullName: string;
  email: string;
  phone: string;
}

interface StandardPayload extends BasePayload {
  status: string;
}

interface WithIssuePayload extends BasePayload {
  issueType: string;
}

export function useCreateCustomer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStandard = async (payload: StandardPayload): Promise<Customer | null> => {
    return submit("/create-democustomer", payload);
  };

  const createWithIssue = async (payload: WithIssuePayload): Promise<Customer | null> => {
    return submit("/create-democustomer-wi", payload);
  };

  const createWithoutIssue = async (payload: BasePayload): Promise<Customer | null> => {
    return submit("/create-democustomer-woi", payload);
  };

  const submit = async (url: string, payload: unknown): Promise<Customer | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, payload);
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createStandard, createWithIssue, createWithoutIssue, loading, error };
}