import { Request, Response } from "express"
import { handleCustomerIntent } from "../../services/conversation/conversationService"
import { recordCustomerReply, getConversation } from "../../services/conversation/conversationService"

export const GetConversation = async (req: Request, res: Response) => {
  try {
    const  recoveryCaseId  = req.params.recoveryCaseId as string
    const messages = await getConversation(recoveryCaseId)

    res.status(200).json({
      success: true,
      message: "Conversation fetched",
      data: messages,
    })
  } catch (err) {
    console.error("GetConversation error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const ReplyAsCustomer = async (req: Request, res: Response) => {
  try {
    const  recoveryCaseId = req.params.recoveryCaseId as string
    const { customerId, content, channel } = req.body

    const result = await recordCustomerReply({
      customerId,
      recoveryCaseId,
      content,
      channel: channel || "in_app",
    })

    const followUp = await handleCustomerIntent({
      recoveryCaseId,
      customerId,
      intent: result.intent,
    })

    res.status(200).json({
      success: true,
      message: "Customer reply recorded",
      data: { ...result, followUp },
    })
  } catch (err) {
    console.error("ReplyAsCustomer error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}