import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { logger } from "@/services"
import InternalServerError from "@/errors/InternalServerError"
import HTTPError from "@/errors/HTTPError"

export const errorHandler: ErrorRequestHandler = (
    err: HTTPError,
    _: Request,
    res: Response,
    __: NextFunction
) => {
    logger.error(err.message)
    if (!err.status) {
        throw new InternalServerError(err.message)
    } else {
        res.status(err.status).json({
            message: err.message
        })
    }
}