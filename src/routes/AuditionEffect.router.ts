import express, { Router } from "express"
import AuditionEffectController from "@/controllers/AuditionEffect.controller"

export default class AuditionEffectRouter {
    static url = "/effect"

    static get router(): Router {
        const router = express.Router()

        router.get("/", AuditionEffectController.getMany)
        router.get("/:id", AuditionEffectController.getOneById)

        return router
    }
}