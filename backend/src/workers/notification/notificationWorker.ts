import { IWorkflowStep } from "../../models/WorkflowStep.Model"
import { sendEmail, sendWhatsApp } from "../../services/notification/notificationService"

export const executeNotification = async (
  step: IWorkflowStep,
  channel: "email" | "whatsapp",
  data: { customerId: string; message: string }
) => {
  const notification =
    channel === "email"
      ? await sendEmail({ customer: data.customerId, message: data.message })
      : await sendWhatsApp({ customer: data.customerId, message: data.message })

  return { skipped: false, reason: undefined, payment: undefined, notification }
}