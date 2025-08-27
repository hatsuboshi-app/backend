import express, { Request, Response } from "express"
import config from "@/config/config"
import dotenv from 'dotenv'
import { logger } from "@/services"
import CharacterRouter from "@/routes/Character.router"
import { errorHandler } from "@/middlewares/errorHandler"
import AuditionEffectRouter from "@/routes/AuditionEffect.router"
import AuditionTerminologyRouter from "@/routes/AuditionTerminology.router"
import PDrinkRouter from "@/routes/PDrink.router"
import PIdolRouter from "@/routes/PIdol.router"
import PItemRouter from "@/routes/PItem.router"
import SkillRouter from "@/routes/Skill.router"
import SupportCardRouter from "@/routes/SupportCard.router"

dotenv.config({ quiet: true })

const app = express()

app.use(express.json())
app.use(require("cors"))

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "ok",
        env: config.nodeEnv
    })
})

app.use(AuditionEffectRouter.url, AuditionEffectRouter.router)
app.use(AuditionTerminologyRouter.url, AuditionTerminologyRouter.router)
app.use(CharacterRouter.url, CharacterRouter.router)
app.use(PDrinkRouter.url, PDrinkRouter.router)
app.use(PIdolRouter.url, PIdolRouter.router)
app.use(PItemRouter.url, PItemRouter.router)
app.use(SkillRouter.url, SkillRouter.router)
app.use(SupportCardRouter.url, SupportCardRouter.router)

app.use(errorHandler)

app.listen(config.port, () => {
    logger.info(`Server Running! // port: ${config.port}, env: ${config.nodeEnv}\n`)
})