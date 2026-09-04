import { Request, Response } from "express"
import {
  handleRazorpayWebhook,
} from "../../services/webhook/webhookService"


export const RazorpayWebhook = async (req: Request, res: Response) => {
  try {
    await handleRazorpayWebhook(req.body, req.headers)

    res.status(200).json({
      success: true,
      message: "Razorpay webhook processed",
    })
  } catch (err) {
    console.error("RazorpayWebhook error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}