import { Queue, Worker } from "bullmq"
import { redisConnection } from "../../config/redisConnection"
import { Workflow } from "../../models/Workflow.Model"
import { RecoveryCase } from "../../models/RecoveryCase.Model"
import { evaluatePolicy } from "../../core/policy/policyEngine"
import { moveToNextStep, stopWorkflowById } from "../../core/workflow/workflowEngine"

export const workflowQueue = new Queue("workflow-queue", { connection: redisConnection })

export const scheduleWorkflowAdvance = async (data: { workflowId: string; delayMinutes: number }) => {
  await workflowQueue.add(
    "advance-workflow",
    { workflowId: data.workflowId },
    { delay: data.delayMinutes * 60 * 1000 }
  )
}

export const workflowWorkerProcessor = new Worker(
  "workflow-queue",
  async (job) => {
    const { workflowId } = job.data

    const workflow = await Workflow.findById(workflowId)
    if (!workflow || workflow.status !== "in_progress") return

    const recoveryCase = await RecoveryCase.findById(workflow.recoveryCase)
    if (!recoveryCase) return

    // Re-check before advancing — case may have resolved since this job was scheduled
    const policyResult = await evaluatePolicy(recoveryCase, workflow._id.toString(), workflow.nextAction)

    if (policyResult.shouldStop) {
      await stopWorkflowById(workflow._id.toString())
      return
    }

    if (!policyResult.allowed) return // still on cooldown / limit reached, leave as is

    await moveToNextStep(workflow._id.toString(), workflow.nextAction, new Date())
  },
  { connection: redisConnection }
)