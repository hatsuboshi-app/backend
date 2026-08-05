import { RequestHandler } from "express"
import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import { parsePfs } from "@/services/repository/repository.service"
import { IPItem, PItemFilterOptions } from "@hatsuboshi/types"

export default class PItemController {
    static getMany: RequestHandler = async (req, res) => {
        const pfs = parsePfs<PItemFilterOptions, IPItem>(req)
        const r = await db.getPItems(pfs.p, pfs.f, pfs.s)
        res.json(r.toJSON())
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