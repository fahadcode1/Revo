import { Request, Response } from "express"
import {
  getRevenueAtRisk,
  getRevenueRecovered,
  getRecoveryRate,
  getFailedRecoveries,
  getActiveRecoveries,
} from "../../services/analytics/analyticsService"

export const GetRevenueAtRisk = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query
    const data = await getRevenueAtRisk({ from, to })

    res.status(200).json({
      success: true,
      message: "Revenue at risk fetched",
      data,
    })
  } catch (err) {
    console.error("GetRevenueAtRisk error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const GetRevenueRecovered = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query
    const data = await getRevenueRecovered({ from, to })

    res.status(200).json({
      success: true,
      message: "Revenue recovered fetched",
      data,
    })
  } catch (err) {
    console.error("GetRevenueRecovered error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const GetRecoveryRate = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query
    const data = await getRecoveryRate({ from, to })

    res.status(200).json({
      success: true,
      message: "Recovery rate fetched",
      data,
    })
  } catch (err) {
    console.error("GetRecoveryRate error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const GetFailedRecoveries = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query
    const data = await getFailedRecoveries({ from, to })

    res.status(200).json({
      success: true,
      message: "Failed recoveries fetched",
      data,
    })
  } catch (err) {
    console.error("GetFailedRecoveries error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const GetActiveRecoveries = async (req: Request, res: Response) => {
  try {
    const data = await getActiveRecoveries()

    res.status(200).json({
      success: true,
      message: "Active recoveries fetched",
      data,
    })
  } catch (err) {
    console.error("GetActiveRecoveries error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}