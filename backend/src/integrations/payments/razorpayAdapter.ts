import { PaymentProvider } from "./paymentProvider"

export const razorpayAdapter: PaymentProvider = {
  retryPayment: async (providerPaymentId: string) => {
    // TODO: call Razorpay SDK/API to retry the charge
    throw new Error("razorpayAdapter.retryPayment not implemented yet")
  },

  checkPaymentStatus: async (providerPaymentId: string) => {
    // TODO: call Razorpay SDK/API to fetch payment status
    throw new Error("razorpayAdapter.checkPaymentStatus not implemented yet")
  },

  createPaymentLink: async (data: { amount: number; currency: string; customerEmail?: string }) => {
    // TODO: call Razorpay Payment Links API
    throw new Error("razorpayAdapter.createPaymentLink not implemented yet")
  },
}