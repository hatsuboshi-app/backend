import express, { Request, Response } from "express"
import config from "@/config"
import cors from "cors"
import { db, logger } from "@/services"
import { errorHandler } from "@/middlewares/errorHandler"
import morgan from "morgan"
// @ts-ignore
import { RegisterRoutes as RegisterV1Routes } from "@/routes/v1/routes"

const app = express()

app.use(morgan(':date :method :url :status :res[content-length] - :response-time ms'))
app.use(express.json())
app.use(cors())  // TODO: update cors rules for cookies

app.get("/", (_: Request, res: Response) => {
    res.json({
        version: "1",
        environment: config.env,
        repository: db.id
    })
})

// v1
const v1Router = express.Router()
RegisterV1Routes(v1Router)
app.use('/v1', v1Router)

app.use(errorHandler)

app.listen(config.port, () => {
    logger.info(`server live  //  http://localhost:${config.port}  //  env: ${config.env}\n`)
})
