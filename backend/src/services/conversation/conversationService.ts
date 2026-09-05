import { Message } from "../../models/Message.Model"
import { interpretCustomerMessage, CustomerIntent } from "../../ai/responseInterpreter/responseInterpreter"
import { RecoveryCase } from "../../models/RecoveryCase.Model"
import { resolveRecovery, stopRecovery } from "../recovery/recoveryService"
import { moveToNextStep } from "../../core/workflow/workflowEngine"
import { recordSystemActivity } from "../audit/auditService"

export const recordAIMessage = async (data: {
  customerId: string
  recoveryCaseId: string
  content: string
  channel: string
  messageType: string
}) => {
  const message = await Message.create({
    customer: data.customerId,
    recoveryCase: data.recoveryCaseId,
    sender: "AI",
    channel: data.channel,
    content: data.content,
    messageType: data.messageType,
  })

  return message
}

export const recordSystemMessage = async (data: {
  customerId: string
  recoveryCaseId: string
  content: string
  messageType: string
}) => {
  const message = await Message.create({
    customer: data.customerId,
    recoveryCase: data.recoveryCaseId,
    sender: "SYSTEM",
    channel: "in_app",
    content: data.content,
    messageType: data.messageType,
  })

  return message
}

export const recordCustomerReply = async (data: {
  customerId: string
  recoveryCaseId: string
  content: string
  channel: string
}): Promise<{ message: any; intent: CustomerIntent }> => {
  const message = await Message.create({
    customer: data.customerId,
    recoveryCase: data.recoveryCaseId,
    sender: "CUSTOMER",
    channel: data.channel,
    content: data.content,
    messageType: "reply",
  })

  const intent = await interpretCustomerMessage(data.content)

  return { message, intent }
}

export const getConversation = async (recoveryCaseId: string) => {
  const messages = await Message.find({ recoveryCase: recoveryCaseId }).sort({ createdAt: 1 })
  return messages
}

export const handleCustomerIntent = async (data: {
  recoveryCaseId: string
  customerId: string
  intent: CustomerIntent
}) => {
  const recoveryCase = await RecoveryCase.findById(data.recoveryCaseId)
  if (!recoveryCase) {
    throw new Error("Recovery case not found")
  }

  const workflowId = recoveryCase.currentWorkflow?.toString()

  switch (data.intent.intent) {
    case "promise_to_pay": {
      if (workflowId) {
        await moveToNextStep(
          workflowId,
          "RETRY_PAYMENT",
          data.intent.promisedDate ? new Date(data.intent.promisedDate) : new Date()
        )
      }

      await recordSystemActivity({
        customer: data.customerId,
        recoveryCase: data.recoveryCaseId,
        action: "CUSTOMER_PROMISED_PAYMENT",
        actor: "ai",
        result: "retry_scheduled",
      })

      return { action: "retry_scheduled" }
    }

    case "dispute": {
      if (workflowId) {
        await moveToNextStep(workflowId, "ESCALATE_TO_HUMAN", new Date())
      }

      await recordSystemActivity({
        customer: data.customerId,
        recoveryCase: data.recoveryCaseId,
        action: "CUSTOMER_DISPUTED",
        actor: "ai",
        result: "escalated",
      })

      return { action: "escalated" }
    }

    case "request_help": {
      if (workflowId) {
        await moveToNextStep(workflowId, "ESCALATE_TO_HUMAN", new Date())
      }

      await recordSystemActivity({
        customer: data.customerId,
        recoveryCase: data.recoveryCaseId,
        action: "CUSTOMER_REQUESTED_HELP",
        actor: "ai",
        result: "escalated",
      })

      return { action: "escalated" }
    }

    case "refusal": {
      await stopRecovery(data.recoveryCaseId)

      await recordSystemActivity({
        customer: data.customerId,
        recoveryCase: data.recoveryCaseId,
        action: "CUSTOMER_REFUSED",
        actor: "ai",
        result: "stopped",
      })

      return { action: "stopped" }
    }

    default: {
      return { action: "no_change" }
    }
  }
}