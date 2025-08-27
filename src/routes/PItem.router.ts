import express, { Router } from "express"
import PItemController from "@/controllers/PItem.controller"

export default class PItemRouter {
    static url = "/item"

    static get router(): Router {
        const router = express.Router()

        router.get("/", PItemController.getMany)
        router.get("/:id", PItemController.getOneById)

        return router
    }
}