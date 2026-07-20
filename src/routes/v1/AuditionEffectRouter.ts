import express, { Router } from "express"
import AuditionEffectController from "@/controllers/AuditionEffect.controller"

export default class AuditionEffectRouterV1 {
    static url = `/effects`

    static get router(): Router {
        const router = express.Router()

        router.get("/", AuditionEffectController.getMany)
        router.get("/:id", AuditionEffectController.getOneById)

        return router
    }
}