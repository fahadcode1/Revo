import { Request, Response } from "express";
import express from "express"
import dns from "dns"
import cors from "cors"
import env from "./config/env"
import { connectDb } from "./lib/db";
import cookieParser from "cookie-parser"
import demoRoutes from "./routes/v1/demo.route";
import customerRoutes from "./routes/v1/customer.route";
import recoveryRouter from "./routes/v1/recovery.route";
import policyRouter from "./routes/v1/policy.route";
import analyticsRouter from "./routes/v1/analytics.route";
import settingRouter from "./routes/v1/setting.route";
import webhookRouter from "./routes/v1/webhook.route";
import workflowRouter from "./routes/v1/workflow.route";
import { requestLogger } from "./middlewares/requestLogger"
import { errorMiddleware } from "./middlewares/errorMiddleware"
import conversationRouter from "./routes/v1/conversation.route"



dns.setServers(["1.1.1.1", "8.8.8.8"])

const PORT = env.port || 3000
const app = express()

const allowedOrigins = env.allowedOrgins
  ? env.allowedOrgins.split(",").map((origin) => origin.trim())
  : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],  
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(cookieParser())

// Webhook routes need the RAW body for signature verification —
// this must be registered BEFORE express.json() and scoped only to the webhook path.
app.use('/api/v1/webhook', express.raw({ type: 'application/json' }), webhookRouter)

app.use(express.json())
app.use(requestLogger)

app.use('/api/v1', customerRoutes)
app.use('/api/v1', demoRoutes)
app.use('/api/v1', recoveryRouter)
app.use('/api/v1', policyRouter)
app.use('/api/v1', analyticsRouter)
app.use('/api/v1', settingRouter)
app.use('/api/v1', workflowRouter)
app.use('/api/v1', conversationRouter)

app.get("/test", (req: Request, res: Response) => {
  res.json({ message: "CORS is working!" })
})

// Error middleware MUST be last, after all routes
app.use(errorMiddleware)

const startServer = async () => {
  await connectDb()

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

startServer()