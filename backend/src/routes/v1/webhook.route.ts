import { Router } from "express";
import { RazorpayWebhook } from "../../controllers/webhooks/webhookController";


const webhookRouter = Router()


webhookRouter.post('razorpayhook-process', RazorpayWebhook)


export default webhookRouter