import { Queue, Worker } from "bullmq"
import { redisConnection } from "../../config/redisConnection"
import { scheduleRetryPayment } from "../payment/paymentQueue"
import { scheduleReminder } from "../notification/notificationQueue"
import { scheduleWorkflowAdvance } from "../worlflow/workflowQueue"

export const recoveryQueue = new Queue("recovery-queue", { connection: redisConnection })

export const scheduleRecoveryAction = async (data: {
  action: string
  stepId: string
  workflowId: string
  paymentId?: string
  customerId?: string
  message?: string
  delayMinutes: number
}) => {
  await recoveryQueue.add("schedule-action", data, { delay: 0 })
}

export const recoveryWorkerProcessor = new Worker(
  "recovery-queue",
  async (job) => {
    const { action, stepId, workflowId, paymentId, customerId, message, delayMinutes } = job.data

    switch (action) {
      case "RETRY_PAYMENT":
        if (!paymentId) throw new Error("paymentId required for RETRY_PAYMENT")
        return await scheduleRetryPayment({ stepId, paymentId, delayMinutes })

      case "SEND_EMAIL":
        if (!customerId || !message) throw new Error("customerId/message required for SEND_EMAIL")
        return await scheduleReminder({ stepId, customerId, channel: "email", message, delayMinutes })

      case "SEND_WHATSAPP":
        if (!customerId || !message) throw new Error("customerId/message required for SEND_WHATSAPP")
        return await scheduleReminder({ stepId, customerId, channel: "whatsapp", message, delayMinutes })

      default:
        return await scheduleWorkflowAdvance({ workflowId, delayMinutes })
    }
  },
  { connection: redisConnection }
)