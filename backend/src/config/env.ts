import dotenv from "dotenv"

dotenv.config()

interface Config {
    port: number
    nodeEnv: string
    groqApi : string
    mongoUri: string
    ownerFullName : string
    ownerEmail : string
    ownerMobileNumber : string
    allowedOrgins : string
    redisHost : string
    redisPort : string
    redisPassword : string
    paymentProviderMode : string

}

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    groqApi : process.env.GROQ_API || '',
    mongoUri: process.env.MONGO_URI || '',
    ownerFullName : process.env.OWNER_FULL_NAME || '',
    ownerEmail : process.env.OWNER_EMAIL || '',
    ownerMobileNumber : process.env.OWNER_MOBILE_NUMBER || '',
    allowedOrgins : process.env.ALLOWED_ORIGINS || '',
    redisHost : process.env.REDIS_HOST || '',
    redisPort : process.env.REDIS_PORT || '',
    redisPassword : process.env.REDIS_PASSWORD || '',
    paymentProviderMode: process.env.PAYMENT_PROVIDER_MODE || "mock", 



}

const requiredVars: (keyof Config)[] = ['mongoUri' ]

for (const key of requiredVars) {
    if (!config[key]) {
        throw new Error(`Missing required env variable for: ${key}`)
    }
}

export default config