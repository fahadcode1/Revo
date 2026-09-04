import { Payment } from "../../models/Payment.Model"

export const createPayment = async (data: {
  customer: string
  amount: number
  currency: string
  status: string
  provider: string
  failureReason?: string
}) => {
  const payment = await Payment.create(data)
  return payment
}

export const updatePayment = async (paymentId: string, updates: Partial<{
  amount: number
  currency: string
  status: string
  failureReason: string
  provider: string
}>) => {
  const payment = await Payment.findByIdAndUpdate(paymentId, updates, { new: true })
  if (!payment) {
    throw new Error("Payment not found")
  }

  return payment
}

export const getPaymentStatus = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).select("status failureReason")
  if (!payment) {
    throw new Error("Payment not found")
  }

  return payment
}

export const retryPaymentThroughProvider = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId)
  if (!payment) {
    throw new Error("Payment not found")
  }

  // TODO: call actual provider SDK (Razorpay/Stripe) retry endpoint here
  payment.status = "processing"
  await payment.save()

  return payment
}