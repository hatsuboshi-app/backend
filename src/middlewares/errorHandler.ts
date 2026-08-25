import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { logger } from "@/services"
import InternalServerError from "@/errors/InternalServerError"
import HTTPError from "@/errors/HTTPError"

export const errorHandler: ErrorRequestHandler = (err: Error, _: Request, res: Response, __: NextFunction) => {
    logger.warn(err.message)
    if (err instanceof HTTPError) {
        res.status(err.status).json(err.payload)
    } else {
        throw new InternalServerError(err.message)
    }
}