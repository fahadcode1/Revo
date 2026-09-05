import { PaymentProvider } from "./paymentProvider"

export const mockPaymentProvider: PaymentProvider = {
  retryPayment: async (providerPaymentId: string) => {
    // simulate 70% success rate
    const success = Math.random() < 0.7

    return {
      status: success ? "success" : "failed",
      providerRef: `mock_${providerPaymentId}_${Date.now()}`,
    }
  },

  checkPaymentStatus: async (providerPaymentId: string) => {
    return { status: "pending" }
  },

  createPaymentLink: async (data: { amount: number; currency: string; customerEmail?: string }) => {
    return { link: `https://mock-payments.local/pay/${Date.now()}` }
  },
}