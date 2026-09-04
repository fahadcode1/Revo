import { Policy } from "../../models/Policy.Model"

export const createPolicy = async (data: {
  problemType: string
  allowedActions: string[]
  retryLimits: number
  cooldowns: number
  communicationRules: Record<string, unknown>
}) => {
  const existing = await Policy.findOne({ problemType: data.problemType })
  if (existing) {
    throw new Error("Policy already exists for this problem type")
  }

  const policy = await Policy.create(data)
  return policy
}

export const updatePolicy = async (policyId: string, updates: Partial<{
  allowedActions: string[]
  retryLimits: number
  cooldowns: number
  communicationRules: Record<string, unknown>
}>) => {
  const policy = await Policy.findByIdAndUpdate(policyId, updates, { new: true })
  if (!policy) {
    throw new Error("Policy not found")
  }

  return policy
}

export const getPolicies = async (filters: { problemType?: any }) => {
  const query: Record<string, any> = {}

  if (filters.problemType) {
    query.problemType = filters.problemType
  }

  const policies = await Policy.find(query)
  return policies
}

export const setPolicyEnabled = async (policyId: string, enabled: boolean) => {
  const policy = await Policy.findByIdAndUpdate(policyId, { enabled }, { new: true })
  if (!policy) {
    throw new Error("Policy not found")
  }

  return policy
}

export const loadApplicablePolicy = async (problemType: string) => {
  const policy = await Policy.findOne({ problemType })
  if (!policy) {
    throw new Error("No policy configured for this problem type")
  }

  return policy
}

export const validateRequestedAction = async (problemType: string, action: string) => {
  const policy = await loadApplicablePolicy(problemType)

  if (!policy.allowedActions.includes(action)) {
    throw new Error(`Action "${action}" is not allowed under the current policy`)
  }

  return true
}

export const deletePolicy = async (policyId: string) => {
  const policy = await Policy.findByIdAndDelete(policyId)
  if (!policy) {
    throw new Error("Policy not found")
  }

  return policy
}