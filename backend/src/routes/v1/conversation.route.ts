import express from "express"
import { GetConversation, ReplyAsCustomer } from "../../controllers/conversation/conversationController"

const router = express.Router()

router.get("/recovery-cases/:recoveryCaseId/conversation", GetConversation)
router.post("/recovery-cases/:recoveryCaseId/conversation/reply", ReplyAsCustomer)

export default router