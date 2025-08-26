import express, { Router } from "express"
import CharacterController from "@/controllers/character.controller"

export default class CharacterRouter {
    static url = "/character"

    static get router(): Router {
        const router = express.Router()

        router.get("/", CharacterController.getAllCharacters)

        return router
    }
}