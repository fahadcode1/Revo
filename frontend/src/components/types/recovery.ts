export interface RecoveryCustomer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryPayment {
  _id: string;
  customer: string;
  amount: number;
  currency: string;
  status: string;
  failureReason?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}


export interface RecoveryWorkflow {
  _id: string;
  type?: string;
  status?: string;
  currentStep?: string;
  [key: string]: unknown;
}

export interface RecoveryCase {
  _id: string;
  customer: RecoveryCustomer;
  payment: RecoveryPayment;
  revenueAtRisk: number;
  problemType: string;
  status: "open" | "in_progress" | "resolved" | "failed" | string;
  aiDiagnosis: string;
  currentWorkflow?: RecoveryWorkflow;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}