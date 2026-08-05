import express, { Request, Response } from "express"
import config from "@/config/config"
import cors from "cors"
import { logger } from "@/services"
import CharacterRouterV1 from "@/routes/v1/Character.router"
import { errorHandler } from "@/middlewares/errorHandler"
import AuditionEffectRouterV1 from "@/routes/v1/AuditionEffectRouter"
import AuditionTerminologyRouterV1 from "@/routes/v1/AuditionTerminology.router"
import PDrinkRouterV1 from "@/routes/v1/PDrink.router"
import PIdolRouterV1 from "@/routes/v1/PIdol.router"
import PItemRouterV1 from "@/routes/v1/PItem.router"
import SkillRouterV1 from "@/routes/v1/Skill.router"
import SupportCardRouterV1 from "@/routes/v1/SupportCard.router"
import morgan from "morgan"

const app = express()

app.use(morgan(':date :method :url :status :res[content-length] - :response-time ms'))
app.use(express.json())
app.use(cors())

app.get("/", (req: Request, res: Response) => {
    res.json({
        version: "v1",
        env: config.env
    })
})

// v1
app.use("/v1" + AuditionEffectRouterV1.url, AuditionEffectRouterV1.router)
app.use("/v1" + AuditionTerminologyRouterV1.url, AuditionTerminologyRouterV1.router)
app.use("/v1" + CharacterRouterV1.url, CharacterRouterV1.router)
app.use("/v1" + PDrinkRouterV1.url, PDrinkRouterV1.router)
app.use("/v1" + PIdolRouterV1.url, PIdolRouterV1.router)
app.use("/v1" + PItemRouterV1.url, PItemRouterV1.router)
app.use("/v1" + SkillRouterV1.url, SkillRouterV1.router)
app.use("/v1" + SupportCardRouterV1.url, SupportCardRouterV1.router)

app.use(errorHandler)

app.listen(config.port, () => {
    logger.info(`server live  //  http://localhost:${config.port}  //  env: ${config.env}\n`)
})