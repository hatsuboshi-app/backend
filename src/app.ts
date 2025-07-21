import express, { Request, Response } from "express"
import config from "@/config/config"
import dotenv from 'dotenv'
import { errorHandler } from "@/middlewares"

dotenv.config({ quiet: true })

const app = express()

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.json({
        env: config.nodeEnv
    })
})

app.use(errorHandler)

app.listen(config.port, () => {
    console.log(`Server Running! // port: ${config.port}, env: ${config.nodeEnv}\n`)
})
