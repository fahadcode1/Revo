import { RecoveryCase } from "../../models/RecoveryCase.Model"

export const createRecoveryCase = async (data: {
  customer: string
  payment: string
  revenueAtRisk: number
  problemType: string
  aiDiagnosis: string
}) => {
  const recoveryCase = await RecoveryCase.create({
    ...data,
    status: "open",
  })

  return recoveryCase
}

export const startRecovery = async (recoveryCaseId: string) => {
  const recoveryCase = await RecoveryCase.findById(recoveryCaseId)
  if (!recoveryCase) {
    throw new Error("Recovery case not found")
  }

  recoveryCase.status = "in_progress"
  await recoveryCase.save()

  return recoveryCase
}

export const stopRecovery = async (recoveryCaseId: string) => {
  const recoveryCase = await RecoveryCase.findById(recoveryCaseId)
  if (!recoveryCase) {
    throw new Error("Recovery case not found")
  }

  recoveryCase.status = "stopped"
  await recoveryCase.save()

  return recoveryCase
}

export const resumeRecovery = async (recoveryCaseId: string) => {
  const recoveryCase = await RecoveryCase.findById(recoveryCaseId)
  if (!recoveryCase) {
    throw new Error("Recovery case not found")
  }

  recoveryCase.status = "in_progress"
  await recoveryCase.save()

  return recoveryCase
}

export const resolveRecovery = async (recoveryCaseId: string) => {
  const recoveryCase = await RecoveryCase.findById(recoveryCaseId)
  if (!recoveryCase) {
    throw new Error("Recovery case not found")
  }

  recoveryCase.status = "resolved"
  recoveryCase.resolvedAt = new Date()
  await recoveryCase.save()

  return recoveryCase
}

export const getRecoveryCases = async (filters: { status?: any; problemType?: any }) => {
  const query: Record<string, any> = {}

  if (filters.status) {
    query.status = filters.status
  }

  if (filters.problemType) {
    query.problemType = filters.problemType
  }

  const cases = await RecoveryCase.find(query).sort({ createdAt: -1 })
  return cases
}

export const getRecoveryCaseById = async (recoveryCaseId: string) => {
  const recoveryCase = await RecoveryCase.findById(recoveryCaseId)
  if (!recoveryCase) {
    throw new Error("Recovery case not found")
  }

  return recoveryCase
}

export const manuallyTriggerRecovery = async (data: { recoveryCaseId: string; workflowType: string }) => {
  const recoveryCase = await RecoveryCase.findById(data.recoveryCaseId)
  if (!recoveryCase) {
    throw new Error("Recovery case not found")
  }

  // TODO: delegate to workflowService.createWorkflow + startWorkflow
  recoveryCase.status = "in_progress"
  await recoveryCase.save()

  return recoveryCase
}