import express, { Router } from "express"
import CharacterController from "@/controllers/Character.controller"

export default class CharacterRouter {
    static url = "/character"

    static get router(): Router {
        const router = express.Router()

        router.get("/", CharacterController.getMany)
        router.get("/:id", CharacterController.getOneById)

        return router
    }
}