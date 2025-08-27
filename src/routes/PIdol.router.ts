import express, { Router } from "express"
import PIdolController from "@/controllers/PIdol.controller"

export default class PIdolRouter {
    static url = "/idol"

    static get router(): Router {
        const router = express.Router()

        router.get("/", PIdolController.getMany)
        router.get("/:id", PIdolController.getOneById)

        return router
    }
}