import { IEvent } from "../../models/Event.Model"
import { Payment } from "../../models/Payment.Model"
import { RecoveryCase } from "../../models/RecoveryCase.Model"
import { createRecoveryCase, resolveRecovery, stopRecovery } from "../../services/recovery/recoveryService"
import { recordSystemActivity } from "../../services/audit/auditService"
import { Settings } from "../../models/Settings.Model"
import { createWorkflowForCase, scheduleNextStep } from "../workflow/workflowEngine"
import { evaluatePolicy } from "../policy/policyEngine"
import { ActionType } from "../action/actionEngine"
import { generateRecoveryMessage } from "../../ai/messageGenerator/messageGenerator"
import { recordAIMessage } from "../../services/conversation/conversationService"
import { Customer } from "../../models/Customer.Model"

const isEngineEnabled = async () => {
  return true 
}

import { analyzePaymentFailure } from "../../ai/diagnosis/diagnosisService"

const runAIDiagnosis = async (event: IEvent, payment: any) => {
  const payload: any = event.payload

  const diagnosis = await analyzePaymentFailure({
    provider: payment.provider,
    failureReason: payload?.errorCode || payment.failureReason || "unknown",
    amount: payment.amount,
    currency: payment.currency,
  })

  return {
    problemType: diagnosis.reason,
    aiDiagnosis: `AI diagnosed (confidence ${diagnosis.confidence}): ${diagnosis.reason}`,
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

  if (existing) return { recoveryCase: existing, isNew: false }

  const recoveryCase = await createRecoveryCase({
    customer: data.customerId,
    payment: data.paymentId,
    revenueAtRisk: data.revenueAtRisk,
    problemType: data.problemType,
    aiDiagnosis: data.aiDiagnosis,
  })

  return { recoveryCase, isNew: true }
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

const { problemType, aiDiagnosis } = await runAIDiagnosis(event, payment)

  const { recoveryCase, isNew } = await findOrCreateRecoveryCase({
    customerId: payment.customer.toString(),
    paymentId: payment._id.toString(),
    revenueAtRisk,
    problemType,
    aiDiagnosis,
  })

   if (isNew) {
  console.log("AUTO-SEND TRIGGERED for recoveryCase:", recoveryCase._id.toString())
  const customer = await Customer.findById(payment.customer)
  console.log("Customer found:", !!customer)

  if (customer) {
    try {
      console.log("Calling generateRecoveryMessage...")
      const messageContent = await generateRecoveryMessage({
        customerName: customer.fullName,
        amount: payment.amount,
        currency: payment.currency,
        reason: problemType,
      })
      console.log("AI message generated:", messageContent)

      await recordAIMessage({
        customerId: customer._id.toString(),
        recoveryCaseId: recoveryCase._id.toString(),
        content: messageContent,
        channel: "in_app",
        messageType: "recovery_prompt",
      })
      console.log("AI message saved successfully")
    } catch (err) {
      console.error("Auto-send recovery message failed:", err)
    }
  }
} else {
  console.log("SKIPPED auto-send — recovery case already existed (isNew = false)")
}

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