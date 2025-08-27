import { RequestHandler } from "express"
import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"

export default class AuditionEffectController {
    static getMany: RequestHandler = async (req, res) => {
        const r = await db.getAllAuditionEffects()
        res.json(r.map(i => i.toJSON()))
    }

    static getOneById: RequestHandler = async (req, res) => {
        const id: string = String(req.params.id)
        const r = await db.getAuditionEffectById(id)
        if (r.success) {
            res.json(r.data.toJSON())
        } else {
            throw new NotFoundError()
        }
    }
}