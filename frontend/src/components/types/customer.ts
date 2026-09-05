export interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;        // e.g. "active" | "issue" | "resolved" — confirm actual values
  issueType?: string;
  createdAt?: string;
  
}

export interface PaymentIssue {
  _id?: string;
  id?: string;
  failureReason: "insufficient_funds" | "card_expired" | "bank_declined" | "network_error" | string;
  amount?: number;
  attemptNumber?: number;
  status?: string;
  createdAt?: string;
}
export const FAILURE_REASON_META: Record<string, { label: string; color: string }> = {
  insufficient_funds: { label: "Insufficient funds", color: "text-yellow-400" },
  card_expired: { label: "Card expired", color: "text-red-400" },
  bank_declined: { label: "Bank declined", color: "text-red-400" },
  network_error: { label: "Network error", color: "text-blue-400" },
};

