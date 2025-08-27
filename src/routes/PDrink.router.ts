import express, { Router } from "express"
import PDrinkController from "@/controllers/PDrink.controller"

export default class PDrinkRouter {
    static url = "/drink"

    static get router(): Router {
        const router = express.Router()

        router.get("/", PDrinkController.getMany)
        router.get("/:id", PDrinkController.getOneById)

        return router
    }
}