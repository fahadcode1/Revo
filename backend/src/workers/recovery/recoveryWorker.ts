import { WorkflowStep, IWorkflowStep } from "../../models/WorkflowStep.Model"
import { Workflow } from "../../models/Workflow.Model"
import { RecoveryCase } from "../../models/RecoveryCase.Model"
import { checkStoppingConditions } from "../../core/policy/policyEngine"
import { stopWorkflowById, completeWorkflowById } from "../../core/workflow/workflowEngine"
import { recordSystemActivity } from "../../services/audit/auditService"
import { executePaymentRetry } from "../payment/paymentWorker"
import { executeNotification } from "../notification/notificationWorker"

const getDueSteps = async () => {
  return await WorkflowStep.find({
    status: "scheduled",
    scheduledTime: { $lte: new Date() },
  })
}

const executeStep = async (step: IWorkflowStep, recoveryCase: any) => {
  const paymentId = recoveryCase.payment.toString()

  switch (step.action) {
    case "RETRY_PAYMENT": {
      return await executePaymentRetry(step, paymentId)
    }

    case "SEND_EMAIL": {
      return await executeNotification(step, "email", {
        customerId: recoveryCase.customer.toString(),
        message: "Your payment recovery reminder", // TODO: pull from messageGenerator
      })
    }

    case "SEND_WHATSAPP": {
      return await executeNotification(step, "whatsapp", {
        customerId: recoveryCase.customer.toString(),
        message: "Your payment recovery reminder", // TODO: pull from messageGenerator
      })
    }

    default:
      return { skipped: true, reason: `unhandled_action_${step.action}` }
  }
}

export const runRecoveryWorker = async () => {
  const dueSteps = await getDueSteps()

  for (const step of dueSteps) {
    try {
      const workflow = await Workflow.findById(step.workflow)
      if (!workflow) {
        step.status = "failed"
        step.result = "workflow_not_found"
        await step.save()
        continue
      }

      const recoveryCase = await RecoveryCase.findById(workflow.recoveryCase)
      if (!recoveryCase) {
        step.status = "failed"
        step.result = "recovery_case_not_found"
        await step.save()
        continue
      }

      // Re-check condition before executing — case may have resolved already
      if (checkStoppingConditions(recoveryCase)) {
        step.status = "skipped"
        step.result = "recovery_case_already_resolved_or_stopped"
        step.executedTime = new Date()
        await step.save()

        await stopWorkflowById(workflow._id.toString())
        continue
      }

      const result = await executeStep(step, recoveryCase)

      step.status = result.skipped ? "skipped" : "executed"
      step.result = JSON.stringify(result)
      step.executedTime = new Date()
      await step.save()

      if (result.skipped && result.reason === "payment_already_succeeded") {
        await completeWorkflowById(workflow._id.toString())
      }

      await recordSystemActivity({
        customer: recoveryCase.customer.toString(),
        recoveryCase: recoveryCase._id.toString(),
        action: step.action,
        actor: "system",
        result: step.status,
      })
    } catch (err) {
      step.status = "failed"
      step.result = err instanceof Error ? err.message : "unknown_error"
      await step.save()
      console.error("recoveryWorker step error:", err)
    }
  }
}