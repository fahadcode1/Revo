import { IWorkflowStep } from "../../models/WorkflowStep.Model"
import { getPaymentStatus, retryPaymentThroughProvider } from "../../services/payment/paymentService"


export const executePaymentRetry = async (step: IWorkflowStep, paymentId: string) => {
  const currentStatus = await getPaymentStatus(paymentId)

  if (currentStatus.status === "success") {
    return { skipped: true, reason: "payment_already_succeeded", payment: undefined, notification: undefined }
  }

  const payment = await retryPaymentThroughProvider(paymentId)

  return { skipped: false, reason: undefined, payment, notification: undefined }
}