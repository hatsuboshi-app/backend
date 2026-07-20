import express, { Router } from "express"
import CharacterController from "@/controllers/Character.controller"

export default class CharacterRouterV1 {
    static url = `/characters`

    static get router(): Router {
        const router = express.Router()

        router.get("/", CharacterController.getMany)
        router.get("/:id", CharacterController.getOneById)

        return router
    }
}