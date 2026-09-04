import { Request, Response } from "express"
import {
  setRecoveryEngineStatus,
  setAiStatus,
} from "../../services/settings/SettingsService"

export const SetRecoveryEngineStatus = async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body
    const settings = await setRecoveryEngineStatus(enabled)

    res.status(200).json({
      success: true,
      message: `Recovery engine turned ${enabled ? "ON" : "OFF"}`,
      data: settings,
    })
  } catch (err) {
    console.error("SetRecoveryEngineStatus error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const SetAiStatus = async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body
    const settings = await setAiStatus(enabled)

    res.status(200).json({
      success: true,
      message: `AI turned ${enabled ? "ON" : "OFF"}`,
      data: settings,
    })
  } catch (err) {
    console.error("SetAiStatus error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}