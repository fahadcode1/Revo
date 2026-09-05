import { Queue, Worker } from "bullmq"
import { redisConnection } from "../../config/redisConnection"
import { WorkflowStep } from "../../models/WorkflowStep.Model"
import { executeNotification } from "../../workers/notification/notificationWorker"

export const notificationQueue = new Queue("notification-queue", { connection: redisConnection })

export const scheduleReminder = async (data: {
  stepId: string
  customerId: string
  channel: "email" | "whatsapp"
  message: string
  delayMinutes: number
}) => {
  await notificationQueue.add(
    "send-reminder",
    {
      stepId: data.stepId,
      customerId: data.customerId,
      channel: data.channel,
      message: data.message,
    },
    { delay: data.delayMinutes * 60 * 1000 }
  )
}

export const notificationWorkerProcessor = new Worker(
  "notification-queue",
  async (job) => {
    const { stepId, customerId, channel, message } = job.data

    const step = await WorkflowStep.findById(stepId)
    if (!step) throw new Error("Step not found")

    const result = await executeNotification(step, channel, { customerId, message })

    step.status = "executed"
    step.result = JSON.stringify(result)
    step.executedTime = new Date()
    await step.save()
  },
  { connection: redisConnection }
)