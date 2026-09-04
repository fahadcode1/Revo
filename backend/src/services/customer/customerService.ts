import { Customer } from "../../models/Customer.Model"
import type { ICustomer } from "../../models/Customer.Model";
import { createPayment } from "../payment/paymentService"
import { createRecoveryCase } from "../recovery/recoveryService"

export const createRecoveryCaseForPaymentIssue = async (data: {
  customer: ICustomer;
  issue: {
    type: string;
    amount: number;
    currency: string;
    provider: string;
    failureReason: string; 
  };
}) => {
  const payment = await createPayment({
    customer: data.customer._id.toString(),
    amount: data.issue.amount,
    currency: data.issue.currency,
    provider: data.issue.provider,
    status: "failed",
    failureReason: data.issue.failureReason,
  });

  const recoveryCase = await createRecoveryCase({
    customer: data.customer._id.toString(),
    payment: payment._id.toString(),
    revenueAtRisk: payment.amount,
    problemType: data.issue.type,
    status: "failed",
    aiDiagnosis: "",
  });

  return {
    payment,
    recoveryCase,
  };
};



export const createCustomer = async (data: {
  fullName: string;
  email: string;
  phone: string;
  status: string;
  issue?: {
    type: string;
    amount: number;
    currency: string;
    provider: string;
    failureReason: string;
  };
}) => {
  const existing = await Customer.findOne({ email: data.email });

  if (existing) {
    throw new Error("Email already exists");
  }

  const customer = await Customer.create({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    status: data.status,
  });

  let recoveryResult: {
    payment: Awaited<ReturnType<typeof createRecoveryCaseForPaymentIssue>>["payment"];
    recoveryCase: Awaited<ReturnType<typeof createRecoveryCaseForPaymentIssue>>["recoveryCase"];
  } | null = null;

  if (data.issue) {
    recoveryResult = await createRecoveryCaseForPaymentIssue({
      customer,
      issue: data.issue,
    });
  }

  return {
    customer,
    payment: recoveryResult?.payment ?? null,
    recoveryCase: recoveryResult?.recoveryCase ?? null,
  };
};


export const getCustomers = async (filters: { status?: any; search?: any }) => {
  const query: Record<string, any> = {}

  if (filters.status) {
    query.status = filters.status
  }

  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ]
  }

  const customers = await Customer.find(query).sort({ createdAt: -1 })
  return customers
}

export const getCustomerDetails = async (customerId: string) => {
  const customer = await Customer.findById(customerId)
  if (!customer) {
    throw new Error("Customer not found")
  }

  return customer
}

export const updateCustomer = async (customerId: string, updates: Partial<{
  fullName: string
  email: string
  phone: string
  status: string
}>) => {
  const customer = await Customer.findByIdAndUpdate(customerId, updates, { new: true })
  if (!customer) {
    throw new Error("Customer not found")
  }

  return customer
}

export const deleteCustomer = async (customerId: string) => {
  const customer = await Customer.findByIdAndDelete(customerId)
  if (!customer) {
    throw new Error("Customer not found")
  }

  return customer
}