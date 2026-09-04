import { Request, Response } from "express"
import {
  getRecoveryCases,
  getRecoveryCaseById,
  manuallyTriggerRecovery,
  stopRecovery,
  resumeRecovery,
} from "../../services/recovery/recoveryService"

export const GetRecoveryCases = async (req: Request, res: Response) => {
  try {
    const { status, problemType } = req.query
    const cases = await getRecoveryCases({ status, problemType })

    res.status(200).json({
      success: true,
      message: "Recovery cases fetched",
      data: cases,
    })
  } catch (err) {
    console.error("GetRecoveryCases error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const GetRecoveryCase = async (req: Request, res: Response) => {
  try {
    const  recoveryCaseId  = req.params.recoveryCaseId as string 
    const recoveryCase = await getRecoveryCaseById(recoveryCaseId) 

    res.status(200).json({
      success: true,
      message: "Recovery case fetched",
      data: recoveryCase,
    })
  } catch (err) {
    console.error("GetRecoveryCase error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const ManuallyTriggerRecovery = async (req: Request, res: Response) => {
  try {
    const recoveryCaseId = req.params.recoveryCaseId as string
    const { workflowType } = req.body
    const result = await manuallyTriggerRecovery({ recoveryCaseId, workflowType })

    res.status(200).json({
      success: true,
      message: "Recovery triggered manually",
      data: result,
    })
  } catch (err) {
    console.error("ManuallyTriggerRecovery error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const StopRecovery = async (req: Request, res: Response) => {
  try {
    const recoveryCaseId = req.params.recoveryCaseId as string
    const result = await stopRecovery(recoveryCaseId)

    res.status(200).json({
      success: true,
      message: "Recovery stopped",
      data: result,
    })
  } catch (err) {
    console.error("StopRecovery error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const ResumeRecovery = async (req: Request, res: Response) => {
  try {
    const recoveryCaseId = req.params.recoveryCaseId as string
    const result = await resumeRecovery(recoveryCaseId)

    res.status(200).json({
      success: true,
      message: "Recovery resumed",
      data: result,
    })
  } catch (err) {
    console.error("ResumeRecovery error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}