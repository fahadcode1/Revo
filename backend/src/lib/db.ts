import config from "../config/config"
import mongoose from "mongoose"

//connect to MongoDb database

export const connectDb = async () =>    {
    try {
        const db = await mongoose.connect(config.mongoUri as string)
        console.log(`MongoDb Connected : ${db.connection.host}`)
    } catch (err) {
        console.log("Error connecting to MongoDb", err)
        process.exit(1)
    }
}