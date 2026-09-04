import { retryPaymentThroughProvider, getPaymentStatus } from "../../services/payment/paymentService"
import { sendEmail, sendWhatsApp } from "../../services/notification/notificationService"
import { recordSystemActivity } from "../../services/audit/auditService"
import { stopWorkflow as stopWorkflowService } from "../../services/workflow/workflowService"

export const ACTIONS = {
  RETRY_PAYMENT: "RETRY_PAYMENT",
  SEND_EMAIL: "SEND_EMAIL",
  SEND_WHATSAPP: "SEND_WHATSAPP",
  CREATE_PAYMENT_LINK: "CREATE_PAYMENT_LINK",
  CHECK_PAYMENT_STATUS: "CHECK_PAYMENT_STATUS",
  ESCALATE_TO_HUMAN: "ESCALATE_TO_HUMAN",
  WAIT: "WAIT",
  STOP: "STOP",
} as const

export type ActionType = keyof typeof ACTIONS

export interface ActionContext {
  recoveryCaseId: string
  customerId: string
  paymentId?: string
  workflowId?: string
  message?: string
}

export const executeAction = async (action: ActionType, context: ActionContext) => {
  switch (action) {
    case "RETRY_PAYMENT": {
      if (!context.paymentId) throw new Error("paymentId required for RETRY_PAYMENT")
      return await retryPaymentThroughProvider(context.paymentId)
    }

    case "SEND_EMAIL": {
      if (!context.message) throw new Error("message required for SEND_EMAIL")
      return await sendEmail({ customer: context.customerId, message: context.message })
    }

    case "SEND_WHATSAPP": {
      if (!context.message) throw new Error("message required for SEND_WHATSAPP")
      return await sendWhatsApp({ customer: context.customerId, message: context.message })
    }

    case "CREATE_PAYMENT_LINK": {
      // TODO: integrate provider payment-link creation (Razorpay/Stripe)
      return { link: "https://payment-link-placeholder" }
    }

    case "CHECK_PAYMENT_STATUS": {
      if (!context.paymentId) throw new Error("paymentId required for CHECK_PAYMENT_STATUS")
      return await getPaymentStatus(context.paymentId)
    }

    case "ESCALATE_TO_HUMAN": {
      return await recordSystemActivity({
        customer: context.customerId,
        recoveryCase: context.recoveryCaseId,
        action: "ESCALATE_TO_HUMAN",
        actor: "system",
        result: "escalated",
      })
    }

    case "WAIT": {
      return { status: "waiting" }
    }

    case "STOP": {
      if (!context.workflowId) throw new Error("workflowId required for STOP")
      return await stopWorkflowService(context.workflowId)
    }

    default:
      throw new Error(`Unknown action: ${action}`)
  }
}