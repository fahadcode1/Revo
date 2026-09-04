import { Customer } from "../../models/Customer.Model"
import { Payment } from "../../models/Payment.Model"
import { createCustomer, deleteCustomer } from "../customer/customerService"
import { createPayment, updatePayment } from "../payment/paymentService"
import { createRecoveryCase, startRecovery, resolveRecovery } from "../recovery/recoveryService"

export const createDemoCustomer = async (data: {
  fullName: string
  email: string
  phone: string
  status: string
}) => {
  const customer = await createCustomer(data)
  return customer
}

export const deleteDemoCustomer = async (customerId: string) => {
  const customer = await deleteCustomer(customerId)
  return customer
}

export const createCustomerWithIssue = async (data: {
  fullName: string
  email: string
  phone: string
  issueType: string
}) => {
  const customer = await createCustomer({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    status: "issue",
  })

  // TODO: optionally auto-create a demo payment + recovery case here based on issueType

  return customer
}

export const createCustomerWithoutIssue = async (data: {
  fullName: string
  email: string
  phone: string
}) => {
  const customer = await createCustomer({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    status: "active",
  })

  return customer
}

export const createDemoPayment = async (data: {
  customerId: string
  amount: number
  currency: string
  provider: string
}) => {
  const payment = await createPayment({
    customer: data.customerId,
    amount: data.amount,
    currency: data.currency,
    provider: data.provider,
    status: "pending",
  })

  return payment
}

export const simulatePaymentFailure = async (data: {
  paymentId: string
  failureReason: string
}) => {
  const payment = await updatePayment(data.paymentId, {
    status: "failed",
    failureReason: data.failureReason,
  })

  const recoveryCase = await createRecoveryCase({
    customer: payment.customer.toString(),
    payment: payment._id.toString(),
    revenueAtRisk: payment.amount,
    problemType: data.failureReason,
    aiDiagnosis: "Simulated failure for demo purposes",
  })

  return { payment, recoveryCase }
}

export const simulatePaymentSuccess = async (paymentId: string) => {
  const payment = await updatePayment(paymentId, {
    status: "success",
  })

  return payment
}

export const triggerRecoveryScenario = async (data: {
  recoveryCaseId: string
  scenarioType: string
}) => {
  const recoveryCase = await startRecovery(data.recoveryCaseId)
  return recoveryCase
}

export const resetScenario = async (scenarioId: string) => {
  await Payment.findByIdAndDelete(scenarioId)
  // TODO: define what "scenario" fully means — cascade delete related RecoveryCase/Workflow/WorkflowStep/Event/AuditLog if needed
  return true
}