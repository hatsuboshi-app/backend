import express, { Router } from "express"
import SkillController from "@/controllers/Skill.controller"

export default class SkillRouterV1 {
    static url = `/skills`

    static get router(): Router {
        const router = express.Router()

        router.get("/", SkillController.getMany)
        router.get("/:id", SkillController.getOneById)

        return router
    }
}