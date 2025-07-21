import dotenv from "dotenv"

dotenv.config({ quiet: true })

interface Config {
    port: number
    nodeEnv: string
}

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'local',
}

export default config
