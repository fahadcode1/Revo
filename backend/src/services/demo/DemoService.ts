import { Customer } from "../../models/Customer.Model"
import { Payment } from "../../models/Payment.Model"
import { createCustomer, deleteCustomer } from "../customer/customerService"
import { createPayment, updatePayment } from "../payment/paymentService"
import { createRecoveryCase, startRecovery, resolveRecovery } from "../recovery/recoveryService"
import { receiveEvent } from "../event/eventService"
import { processEvent } from "../../core/recovery/recoveryEngine"

export const createDemoCustomer = async (data: {
  fullName: string
  email: string
  phone: string
  status: string
  amount: number
  currency: string
  provider: string
}) => {
  const { customer } = await createCustomer({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    status: data.status,
  })

  const payment = await createDemoPayment({
    customerId: customer._id.toString(),
    amount: data.amount,
    currency: data.currency,
    provider: data.provider,
  })

  return { customer, payment }
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
  amount: number
  currency: string
  provider: string
  failureReason: string
}) => {
  const { customer } = await createCustomer({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    status: "issue",
  })

  const payment = await createDemoPayment({
    customerId: customer._id.toString(),
    amount: data.amount,
    currency: data.currency,
    provider: data.provider,
  })

  const failureResult = await simulatePaymentFailure({
    paymentId: payment._id.toString(),
    failureReason: data.failureReason,
  })

  return { customer, ...failureResult }
}

export const createCustomerWithoutIssue = async (data: {
  fullName: string
  email: string
  phone: string
  amount: number
  currency: string
  provider: string
}) => {
  const { customer } = await createCustomer({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    status: "active",
  })

  const payment = await createDemoPayment({
    customerId: customer._id.toString(),
    amount: data.amount,
    currency: data.currency,
    provider: data.provider,
  })

  return { customer, payment }
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

import { Event } from "../../models/Event.Model"

export const simulatePaymentFailure = async (data: {
  paymentId: string
  failureReason: string
}) => {
  const payment = await updatePayment(data.paymentId, {
    status: "failed",
    failureReason: data.failureReason,
  })

  const event = await Event.create({
    eventType: "payment.failed",
    source: "demo",
    payload: {
      paymentId: payment._id.toString(),
      errorCode: data.failureReason,
    },
    processingStatus: "pending",
    timestamp: new Date(),
  })

  const result = await processEvent(event)

  return { payment, ...result }
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