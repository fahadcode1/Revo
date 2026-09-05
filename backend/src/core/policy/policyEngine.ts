import { loadApplicablePolicy, validateRequestedAction } from "../../services/policy/policyService"
import { getWorkflowHistory } from "../../services/workflow/workflowService"
import { IRecoveryCase } from "../../models/RecoveryCase.Model"

export const determineApplicablePolicy = async (problemType: string) => {
  return await loadApplicablePolicy(problemType)
}

export const isActionAllowed = async (problemType: string, action: string) => {
  return await validateRequestedAction(problemType, action)
}

export const checkRetryCount = async (workflowId: string, action: string, maxRetries: number) => {
  if (!workflowId) {
    return { attemptCount: 0, limitReached: false }
  }

  const history = await getWorkflowHistory(workflowId)
  const attemptCount = history.filter((step) => step.action === action && step.status === "executed").length

  return {
    attemptCount,
    limitReached: attemptCount >= maxRetries,
  }
}

export const checkCooldown = async (workflowId: string, action: string, cooldownMinutes: number) => {
  if (!workflowId) {
    return { onCooldown: false }
  }

  const history = await getWorkflowHistory(workflowId)
  const lastAttempt = history
    .filter((step) => step.action === action && step.executedTime)
    .sort((a, b) => (b.executedTime as any) - (a.executedTime as any))[0]

  if (!lastAttempt || !lastAttempt.executedTime) {
    return { onCooldown: false }
  }

  const cooldownMs = cooldownMinutes * 60 * 1000
  const elapsed = Date.now() - new Date(lastAttempt.executedTime).getTime()

  return { onCooldown: elapsed < cooldownMs, remainingMs: Math.max(cooldownMs - elapsed, 0) }
}

export const checkEscalationRules = (retryLimitReached: boolean, onCooldown: boolean) => {
  // TODO: expand with real escalation rules (e.g. high-value customer, repeated failure types)
  return retryLimitReached && !onCooldown
}

export const checkStoppingConditions = (recoveryCase: IRecoveryCase) => {
  return recoveryCase.status === "resolved" || recoveryCase.status === "stopped"
}

export const evaluatePolicy = async (recoveryCase: IRecoveryCase, workflowId: string, proposedAction: string) => {
  if (checkStoppingConditions(recoveryCase)) {
    return { allowed: false, shouldStop: true, shouldEscalate: false }
  }

  const policy = await determineApplicablePolicy(recoveryCase.problemType)
  await isActionAllowed(recoveryCase.problemType, proposedAction)

  const { limitReached } = await checkRetryCount(workflowId, proposedAction, policy.retryLimits)
  const { onCooldown } = await checkCooldown(workflowId, proposedAction, policy.cooldowns)

  const shouldEscalate = checkEscalationRules(limitReached, onCooldown)

  return {
    allowed: !onCooldown && !limitReached,
    shouldStop: limitReached && !shouldEscalate,
    shouldEscalate,
    policy,
  }
}