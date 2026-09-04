import { sendStructuredRequest } from "../service/aiService"

export interface GeneratedMessage {
  message: string
}

const isGeneratedMessage = (data: unknown): data is GeneratedMessage => {
  const d = data as GeneratedMessage
  return typeof d === "object" && d !== null && typeof d.message === "string"
}

const generate = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  const result = await sendStructuredRequest<GeneratedMessage>(
    { systemPrompt, userPrompt },
    isGeneratedMessage
  )

  return result.message
}

const BASE_RULES = `Respond with ONLY a JSON object, no preamble, no markdown, in this exact shape:
{"message": "..."}
Keep the message short, polite, and professional.`

export const generateRecoveryMessage = async (data: {
  customerName: string
  amount: number
  currency: string
  reason: string
}): Promise<string> => {
  const systemPrompt = `You write payment recovery messages for customers whose payment failed.\n${BASE_RULES}`
  const userPrompt = `Customer: ${data.customerName}\nAmount due: ${data.amount} ${data.currency}\nFailure reason: ${data.reason}`

  return await generate(systemPrompt, userPrompt)
}

export const generateReminderMessage = async (data: {
  customerName: string
  amount: number
  currency: string
  dueDate: string
}): Promise<string> => {
  const systemPrompt = `You write friendly payment reminder messages.\n${BASE_RULES}`
  const userPrompt = `Customer: ${data.customerName}\nAmount due: ${data.amount} ${data.currency}\nDue date: ${data.dueDate}`

  return await generate(systemPrompt, userPrompt)
}

export const generatePaymentLinkMessage = async (data: {
  customerName: string
  paymentLink: string
  amount: number
  currency: string
}): Promise<string> => {
  const systemPrompt = `You write messages that share a payment link with a customer.\n${BASE_RULES}`
  const userPrompt = `Customer: ${data.customerName}\nAmount: ${data.amount} ${data.currency}\nPayment link: ${data.paymentLink}`

  return await generate(systemPrompt, userPrompt)
}

export const generateFollowUpMessage = async (data: {
  customerName: string
  previousAttempts: number
  reason: string
}): Promise<string> => {
  const systemPrompt = `You write a follow-up message after previous recovery attempts have not resolved a payment issue.\n${BASE_RULES}`
  const userPrompt = `Customer: ${data.customerName}\nPrevious attempts: ${data.previousAttempts}\nReason: ${data.reason}`

  return await generate(systemPrompt, userPrompt)
}