import { RequestHandler } from "express"
import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"

export default class SupportCardController {
    static getMany: RequestHandler = async (req, res) => {
        const r = await db.getAllSupportCards()
        res.json(r.map(i => i.toJSON()))
    }

    static getOneById: RequestHandler = async (req, res) => {
        const id: string = String(req.params.id)
        const r = await db.getSupportCardById(id)
        if (r.success) {
            res.json(r.data.toJSON())
        } else {
            throw new NotFoundError()
        }
    }
}