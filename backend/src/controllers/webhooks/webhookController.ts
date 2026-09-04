import { Request, Response } from "express"
import {
  handleRazorpayWebhook,
  handleStripeWebhook,
} from "../../services/WebhookService"

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

export const StripeWebhook = async (req: Request, res: Response) => {
  try {
    await handleStripeWebhook(req.body, req.headers)

    res.status(200).json({
      success: true,
      message: "Stripe webhook processed",
    })
  } catch (err) {
    console.error("StripeWebhook error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}