import express, { Request, Response } from "express"
import config from "@/config/config"
import dotenv from 'dotenv'
import { errorHandler } from "@/middlewares"
import { logger } from "@/services"
import CharacterRouter from "@/routes/character.router";

dotenv.config({ quiet: true })

const app = express()

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "ok",
        env: config.nodeEnv
    })
})

app.use(CharacterRouter.url, CharacterRouter.router)

app.use(errorHandler)

app.listen(config.port, () => {
    logger.info(`Server Running! // port: ${config.port}, env: ${config.nodeEnv}\n`)
})
