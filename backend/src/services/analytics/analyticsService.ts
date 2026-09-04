import { Payment } from "../../models/Payment.Model"
import { RecoveryCase } from "../../models/RecoveryCase.Model"

const buildDateRangeQuery = (from?: any, to?: any) => {
  const query: Record<string, any> = {}

  if (from || to) {
    query.createdAt = {}
    if (from) query.createdAt.$gte = new Date(from)
    if (to) query.createdAt.$lte = new Date(to)
  }

  return query
}

export const getRevenueAtRisk = async (filters: { from?: any; to?: any }) => {
  const query = { ...buildDateRangeQuery(filters.from, filters.to), status: { $in: ["open", "in_progress"] } }

  const result = await RecoveryCase.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$revenueAtRisk" } } },
  ])

  return { revenueAtRisk: result[0]?.total || 0 }
}

export const getRevenueRecovered = async (filters: { from?: any; to?: any }) => {
  const query = { ...buildDateRangeQuery(filters.from, filters.to), status: "resolved" }

  const result = await RecoveryCase.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$revenueAtRisk" } } },
  ])

  return { revenueRecovered: result[0]?.total || 0 }
}

export const getRecoveryRate = async (filters: { from?: any; to?: any }) => {
  const query = buildDateRangeQuery(filters.from, filters.to)

  const total = await RecoveryCase.countDocuments(query)
  const resolved = await RecoveryCase.countDocuments({ ...query, status: "resolved" })

  const rate = total > 0 ? (resolved / total) * 100 : 0

  return { recoveryRate: rate, total, resolved }
}

export const getFailedRecoveries = async (filters: { from?: any; to?: any }) => {
  const query = { ...buildDateRangeQuery(filters.from, filters.to), status: "failed" }

  const failedCases = await RecoveryCase.find(query)
  return failedCases
}

export const getActiveRecoveries = async () => {
  const activeCases = await RecoveryCase.find({ status: "in_progress" })
  return activeCases
}