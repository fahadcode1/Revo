import { Workflow } from "../../models/Workflow.Model"
import { WorkflowStep } from "../../models/WorkflowStep.Model"
import { RecoveryCase } from "../../models/RecoveryCase.Model"
import { evaluatePolicy } from "../../core/policy/policyEngine"
import { moveToNextStep, completeWorkflowById, stopWorkflowById } from "../../core/workflow/workflowEngine"

const getWorkflowsReadyToAdvance = async () => {
  const executedSteps = await WorkflowStep.find({ status: "executed" }).select("workflow")
  const workflowIds = executedSteps.map((s) => s.workflow)

  return await Workflow.find({
    _id: { $in: workflowIds },
    status: "in_progress",
  })
}

export const runWorkflowWorker = async () => {
  const workflows = await getWorkflowsReadyToAdvance()

  for (const workflow of workflows) {
    try {
      const recoveryCase = await RecoveryCase.findById(workflow.recoveryCase)
      if (!recoveryCase) {
        continue
      }

      // Re-check before advancing — recovery case may have changed since step was executed
      const policyResult = await evaluatePolicy(recoveryCase, workflow._id.toString(), workflow.nextAction)

      if (policyResult.shouldStop) {
        await stopWorkflowById(workflow._id.toString())
        continue
      }

      if (policyResult.shouldEscalate) {
        await moveToNextStep(workflow._id.toString(), "ESCALATE_TO_HUMAN", new Date())
        continue
      }

      if (!policyResult.allowed) {
        // still on cooldown or limit reached without escalation — leave as is, worker will re-check next run
        continue
      }

      // TODO: derive the *actual* next action from policy.allowedActions + workflow progress,
      // rather than reusing the same nextAction every time
      await moveToNextStep(workflow._id.toString(), workflow.nextAction, new Date())
    } catch (err) {
      console.error("workflowWorker error for workflow", workflow._id, err)
    }
  }
}