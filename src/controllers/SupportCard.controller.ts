import { RequestHandler } from "express"
import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import { parsePfs } from "@/services/repository/repository.service"
import { ISupportCard, SupportCardFilterOptions } from "@hatsuboshi/types"

export default class SupportCardController {
    static getMany: RequestHandler = async (req, res) => {
        const pfs = parsePfs<SupportCardFilterOptions, ISupportCard>(req)
        const r = await db.getSupportCards(pfs.p, pfs.f, pfs.s)
        res.json(r.toJSON())
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