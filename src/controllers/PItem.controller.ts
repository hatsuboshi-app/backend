import { RequestHandler } from "express"
import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"

export default class PItemController {
    static getMany: RequestHandler = async (req, res) => {
        const r = await db.getAllPItems()
        res.json(r.map(i => i.toJSON()))
    }

    static getOneById: RequestHandler = async (req, res) => {
        const id: string = String(req.params.id)
        const r = await db.getPItemById(id)
        if (r.success) {
            res.json(r.data.toJSON())
        } else {
            throw new NotFoundError()
        }
    }
}