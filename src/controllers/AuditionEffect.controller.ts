import { RequestHandler } from "express"
import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import { AuditionEffectFilterOptions, IAuditionEffect } from "@hatsuboshi/types"
import { parsePfs } from "@/services/repository/repository.service"

export default class AuditionEffectController {
    static getMany: RequestHandler = async (req, res) => {
        const pfs = parsePfs<AuditionEffectFilterOptions, IAuditionEffect>(req)
        const r = await db.getAuditionEffects(pfs.p, pfs.f, pfs.s)
        res.json(r.toJSON())
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