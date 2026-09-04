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
