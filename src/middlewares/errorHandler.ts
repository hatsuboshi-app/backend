import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { logger } from "@/services"
import InternalServerError from "@/errors/types/InternalServerError"
import HTTPError from "@/errors/types/HTTPError"

export const errorHandler: ErrorRequestHandler = (err: Error, _: Request, res: Response, __: NextFunction) => {
    if (err instanceof HTTPError) {
        logger.warn(err.message)
        res.status(err.status).json(err.payload)
        return
    }
    logger.warn(err.stack ?? err.message)
    const internal = new InternalServerError("Internal server error")
    res.status(internal.status).json(internal.payload)
}
