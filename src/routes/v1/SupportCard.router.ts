import express, { Router } from "express"
import SupportCardController from "@/controllers/SupportCard.controller"

export default class SupportCardRouterV1 {
    static url = `/support-cards`

    static get router(): Router {
        const router = express.Router()

        router.get("/", SupportCardController.getMany)
        router.get("/:id", SupportCardController.getOneById)

        return router
    }
}