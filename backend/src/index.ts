import config from "./config/config";
import { connectDb } from "./lib/db";
import express from "express"
import dns from "dns"
import cookieParser from "cookie-parser"

dns.setServers(["1.1.1.1", "8.8.8.8"])

const PORT = config.port || 3000

const app = express()

app.use(cookieParser())
app.use(express.json())



app.listen(PORT, () =>  {
    console.log(`Server is running on port ${PORT}`),
    connectDb()

})