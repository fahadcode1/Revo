import { sendStructuredRequest } from "../service/aiService"

export interface PaymentDiagnosis {
  reason: string
  confidence: number
}

const isPaymentDiagnosis = (data: unknown): data is PaymentDiagnosis => {
  const d = data as PaymentDiagnosis
  return (
    typeof d === "object" &&
    d !== null &&
    typeof d.reason === "string" &&
    typeof d.confidence === "number" &&
    d.confidence >= 0 &&
    d.confidence <= 1
  )
}

const SYSTEM_PROMPT = `You are a payment failure diagnosis engine.
Analyze the given payment failure data and identify the most likely reason.
Respond with ONLY a JSON object, no preamble, no markdown, in this exact shape:
{"reason": "insufficient_balance", "confidence": 0.92}
"reason" must be a short snake_case code. "confidence" must be a number between 0 and 1.`

export const analyzePaymentFailure = async (data: {
  provider: string
  failureReason: string
  amount: number
  currency: string
}): Promise<PaymentDiagnosis> => {
  const userPrompt = `Payment failure data:
Provider: ${data.provider}
Failure reason from provider: ${data.failureReason}
Amount: ${data.amount} ${data.currency}`

  return await sendStructuredRequest<PaymentDiagnosis>(
    { systemPrompt: SYSTEM_PROMPT, userPrompt },
    isPaymentDiagnosis
  )
}