import express, { Router } from "express"
import AuditionTerminologyController from "@/controllers/AuditionTerminology.controller"

export default class AuditionTerminologyRouter {
    static url = "/terminology"

    static get router(): Router {
        const router = express.Router()

        router.get("/", AuditionTerminologyController.getMany)
        router.get("/:id", AuditionTerminologyController.getOneById)

        return router
    }
}