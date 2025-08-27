import express, { Router } from "express"
import SupportCardController from "@/controllers/SupportCard.controller"

export default class SupportCardRouter {
    static url = "/support-card"

    static get router(): Router {
        const router = express.Router()

        router.get("/", SupportCardController.getMany)
        router.get("/:id", SupportCardController.getOneById)

        return router
    }
}