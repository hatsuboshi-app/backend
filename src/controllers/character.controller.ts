import { RequestHandler } from "express"
import { db } from "@/services"

export default class CharacterController {
    static getAllCharacters: RequestHandler = async (req, res, next) => {
        const r = await db.getAllCharacters()
        res.json(r.map(r => r.toJSON()))
    }
}