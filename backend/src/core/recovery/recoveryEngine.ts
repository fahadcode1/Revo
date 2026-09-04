import { IEvent } from "../../models/Event.Model"
import { Payment } from "../../models/Payment.Model"
import { RecoveryCase } from "../../models/RecoveryCase.Model"
import { createRecoveryCase, resolveRecovery, stopRecovery } from "../../services/recovery/recoveryService"
import { recordSystemActivity } from "../../services/audit/auditService"
import { Settings } from "../../models/Settings.Model"
import { createWorkflowForCase, scheduleNextStep } from "../workflow/workflowEngine"
import { evaluatePolicy } from "../policy/policyEngine"
import { ActionType } from "../action/actionEngine"

const isEngineEnabled = async () => {
  const settings = await Settings.findOne()
  return settings ? settings.recoveryEngineEnabled : true
}

// TODO: replace with real AI diagnosis call (LLM/classifier)
const runAIDiagnosis = async (event: IEvent) => {
  const payload: any = event.payload

  return {
    problemType: payload?.errorCode || "unknown_issue",
    aiDiagnosis: `Diagnosed from event ${event.eventType}: ${payload?.errorCode || "no error code"}`,
  }
}

const findOrCreateRecoveryCase = async (data: {
  customerId: string
  paymentId: string
  revenueAtRisk: number
  problemType: string
  aiDiagnosis: string
}) => {
  const existing = await RecoveryCase.findOne({
    payment: data.paymentId,
    status: { $in: ["open", "in_progress"] },
  })

  if (existing) return existing

  return await createRecoveryCase({
    customer: data.customerId,
    payment: data.paymentId,
    revenueAtRisk: data.revenueAtRisk,
    problemType: data.problemType,
    aiDiagnosis: data.aiDiagnosis,
  })
}

export const processEvent = async (event: IEvent) => {
  const engineEnabled = await isEngineEnabled()
  if (!engineEnabled) {
    await recordSystemActivity({
      customer: "",
      recoveryCase: "",
      action: "PROCESS_EVENT",
      actor: "system",
      result: "skipped_engine_disabled",
    })
    return { status: "skipped", reason: "engine_disabled" }
  }

  const payload: any = event.payload
  const paymentId = payload?.paymentId
  if (!paymentId) {
    throw new Error("Event payload missing paymentId")
  }

  const payment = await Payment.findById(paymentId)
  if (!payment) {
    throw new Error("Payment not found for event")
  }

  const revenueAtRisk = payment.amount

  const { problemType, aiDiagnosis } = await runAIDiagnosis(event)

  const recoveryCase = await findOrCreateRecoveryCase({
    customerId: payment.customer.toString(),
    paymentId: payment._id.toString(),
    revenueAtRisk,
    problemType,
    aiDiagnosis,
  })

  const workflowId = recoveryCase.currentWorkflow?.toString()

  const policyResult = await evaluatePolicy(
    recoveryCase,
    workflowId || "",
    "RETRY_PAYMENT" // TODO: derive proposed action from AI diagnosis + policy.allowedActions instead of hardcoding
  )

  if (policyResult.shouldStop) {
    await stopRecovery(recoveryCase._id.toString())
    return { status: "stopped", recoveryCase }
  }

  const workflow = await createWorkflowForCase({
    recoveryCaseId: recoveryCase._id.toString(),
    workflowType: problemType,
    nextAction: "RETRY_PAYMENT" as ActionType,
  })

  await scheduleNextStep(workflow._id.toString(), "RETRY_PAYMENT", new Date())

  await recordSystemActivity({
    customer: payment.customer.toString(),
    recoveryCase: recoveryCase._id.toString(),
    action: "WORKFLOW_SCHEDULED",
    actor: "ai",
    result: "success",
  })

  return { status: "processed", recoveryCase, workflow }
}