import { ConnectionOptions } from "bullmq"
import env from "./env"

export const redisConnection: ConnectionOptions = {
  host: env.redisHost,
  port: Number(env.redisPort),
  password: env.redisPassword,
}