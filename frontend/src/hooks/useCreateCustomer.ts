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
  amount: number;
  currency: string;
  provider: "razorpay";
}

interface WithoutIssuePayload extends BasePayload {
  amount: number;
  currency: string;
  provider: "razorpay";
}

interface WithIssuePayload extends BasePayload {
  issueType: string;
  amount: number;
  currency: string;
  provider: "razorpay";
  failureReason: string;
}


interface WithIssueResult {
  customer: Customer;
  payment: any; 
  recoveryCase: any; 
  status: string;
  workflow?: any;
}

export function useCreateCustomer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async <T>(url: string, payload: unknown): Promise<T | null> => {
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

  const createStandard = async (payload: StandardPayload): Promise<Customer | null> => {
    return submit<Customer>("/create-democustomer", payload);
  };

  const createWithIssue = async (payload: WithIssuePayload): Promise<WithIssueResult | null> => {
    return submit<WithIssueResult>("/create-democustomer-wi", payload);
  };

  const createWithoutIssue = async (payload: WithoutIssuePayload): Promise<Customer | null> => {
    return submit<Customer>("/create-democustomer-woi", payload);
  };

  return { createStandard, createWithIssue, createWithoutIssue, loading, error };
}