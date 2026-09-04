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
app.use(express.json())

app.use('/api/v1', customerRoutes)
app.use('/api/v1', demoRoutes)
app.use('/api/v1', recoveryRouter)
app.use('/api/v1', policyRouter)
app.use('/api/v1',analyticsRouter)
app.use('/api/v1', settingRouter)
app.use('/api/v1/', webhookRouter)
app.use('/api/v1', workflowRouter)

app.get("/test", (req : Request, res : Response)  =>  {
    res.json({ message: "CORS is working!" })
})


app.listen(PORT, () =>  {
    console.log(`Server is running on port ${PORT}`),
    connectDb()

})