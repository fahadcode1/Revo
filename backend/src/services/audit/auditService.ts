import { AuditLog } from "../../models/AuditLog.Model"

export const recordSystemActivity = async (data: {
  customer: string
  recoveryCase: string
  action: string
  actor: "system" | "ai" | "user"
  result: string
}) => {
  const log = await AuditLog.create({
    ...data,
    timestamp: new Date(),
  })

  return log
}

export const getAuditLogs = async (filters: { recoveryCase?: any; customer?: any }) => {
  const query: Record<string, any> = {}

  if (filters.recoveryCase) {
    query.recoveryCase = filters.recoveryCase
  }

  if (filters.customer) {
    query.customer = filters.customer
  }

  const logs = await AuditLog.find(query).sort({ timestamp: -1 })
  return logs
}