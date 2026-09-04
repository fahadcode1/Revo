import { sendStructuredRequest } from "../service/aiService"

export interface CustomerIntent {
  intent: string
  promisedDate: string | null
}

const isCustomerIntent = (data: unknown): data is CustomerIntent => {
  const d = data as CustomerIntent
  return (
    typeof d === "object" &&
    d !== null &&
    typeof d.intent === "string" &&
    (d.promisedDate === null || typeof d.promisedDate === "string")
  )
}

const SYSTEM_PROMPT = `You interpret customer replies during payment recovery conversations.
Respond with ONLY a JSON object, no preamble, no markdown, in this exact shape:
{"intent": "promise_to_pay", "promisedDate": "2026-09-05"}
"intent" must be one of: promise_to_pay, dispute, request_help, refusal, unclear.
"promisedDate" must be an ISO date string (YYYY-MM-DD) if the customer gave a date, otherwise null.
Use today's date as reference when resolving relative dates like "tomorrow".`

export const interpretCustomerMessage = async (
  message: string,
  referenceDate: string = new Date().toISOString().split("T")[0]
): Promise<CustomerIntent> => {
  const userPrompt = `Today's date: ${referenceDate}
Customer message: "${message}"`

  return await sendStructuredRequest<CustomerIntent>(
    { systemPrompt: SYSTEM_PROMPT, userPrompt },
    isCustomerIntent
  )
}