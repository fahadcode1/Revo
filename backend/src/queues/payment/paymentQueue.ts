import { Queue, Worker } from "bullmq"
import { redisConnection } from "../../config/redisConnection"
import { WorkflowStep } from "../../models/WorkflowStep.Model"
import { RecoveryCase } from "../../models/RecoveryCase.Model"
import { checkStoppingConditions } from "../../core/policy/policyEngine"
import { stopWorkflowById, completeWorkflowById } from "../../core/workflow/workflowEngine"
import { executePaymentRetry } from "../../workers/payment/paymentWorker"

export const paymentQueue = new Queue("payment-queue", { connection: redisConnection })

export const scheduleRetryPayment = async (data: {
  stepId: string
  paymentId: string
  delayMinutes: number
}) => {
  await paymentQueue.add(
    "retry-payment",
    { stepId: data.stepId, paymentId: data.paymentId },
    { delay: data.delayMinutes * 60 * 1000 }
  )
}

export const paymentWorkerProcessor = new Worker(
  "payment-queue",
  async (job) => {
    const { stepId, paymentId } = job.data

    const step = await WorkflowStep.findById(stepId)
    if (!step) throw new Error("Step not found")

    const recoveryCase = await RecoveryCase.findOne({ currentWorkflow: step.workflow })
    if (recoveryCase && checkStoppingConditions(recoveryCase)) {
      step.status = "skipped"
      step.result = "recovery_case_already_resolved_or_stopped"
      step.executedTime = new Date()
      await step.save()
      await stopWorkflowById(step.workflow.toString())
      return
    }

    const result = await executePaymentRetry(step, paymentId)

    step.status = result.skipped ? "skipped" : "executed"
    step.result = JSON.stringify(result)
    step.executedTime = new Date()
    await step.save()

    if (result.skipped && result.reason === "payment_already_succeeded") {
      await completeWorkflowById(step.workflow.toString())
    }
  },
  { connection: redisConnection }
)