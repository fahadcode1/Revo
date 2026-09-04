import { groq } from "../../config/groqClient"

const MODEL = "llama-3.3-70b-versatile" // can change to whichever Groq model we're using

export interface AIRequestOptions {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
}

const callAI = async (options: AIRequestOptions): Promise<string> => {
  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: options.maxTokens || 1024,
    messages: [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userPrompt },
    ],
  })

  const text = response.choices?.[0]?.message?.content
  if (!text) {
    throw new Error("AI response contained no text content")
  }

  return text
}

const parseJSONResponse = <T>(raw: string): T => {
  const cleaned = raw.replace(/```json|```/g, "").trim()

  try {
    return JSON.parse(cleaned) as T
  } catch (err) {
    throw new Error(`AI response was not valid JSON: ${cleaned}`)
  }
}

export const sendStructuredRequest = async <T>(
  options: AIRequestOptions,
  validate: (data: unknown) => data is T
): Promise<T> => {
  const raw = await callAI(options)
  const parsed = parseJSONResponse<unknown>(raw)

  if (!validate(parsed)) {
    throw new Error(`AI response failed validation: ${JSON.stringify(parsed)}`)
  }

  return parsed
}