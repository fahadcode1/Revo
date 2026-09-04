import config from "./config/env";
import { connectDb } from "./lib/db";
import express from "express"
import dns from "dns"
import cors from "cors"
import env from "./config/env"
import cookieParser from "cookie-parser"
import customerRoutes from "./routes/v1/customer.route";
import demoRoutes from "./routes/v1/demo.route";
import { Request, Response } from "express";

dns.setServers(["1.1.1.1", "8.8.8.8"])

const PORT = config.port || 3000
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

app.get("/test", (req : Request, res : Response)  =>  {
    res.json({ message: "CORS is working!" })
})


app.listen(PORT, () =>  {
    console.log(`Server is running on port ${PORT}`),
    connectDb()

})