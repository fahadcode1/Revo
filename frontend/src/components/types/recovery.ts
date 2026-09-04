export type RecoveryStatus =
  | "pending"
  | "retrying"
  | "recovered"
  | "escalated"
  | "stopped";

export interface RecoveryCase {
  id: string;
  customerName?: string;
  amount?: number;
  status: RecoveryStatus | string;
  problemType?: string; // insufficient_funds | card_expired | bank_declined | network_error
  attemptCount?: number;
  maxAttempts?: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  workflowType?: string;
}