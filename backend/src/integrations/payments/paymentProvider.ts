export interface PaymentProvider {
  retryPayment(providerPaymentId: string): Promise<{ status: string; providerRef?: string }>
  checkPaymentStatus(providerPaymentId: string): Promise<{ status: string }>
  createPaymentLink(data: { amount: number; currency: string; customerEmail?: string }): Promise<{ link: string }>
}

import { mockPaymentProvider } from "./mockPaymentProvider"
import { razorpayAdapter } from "./razorpayAdapter"
import env from "../../config/env"

export const paymentProvider: PaymentProvider =
  env.paymentProviderMode === "razorpay" ? razorpayAdapter : mockPaymentProvider