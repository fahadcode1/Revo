export interface RecoveryActivityEntry {
  recoveryCaseId: string;
  customer: {
    _id: string;
    fullName: string;
    email: string;
  };
  problemType: string;
  amountRecovered: number;
  attempts: number;
  resolvedAt: string;
}