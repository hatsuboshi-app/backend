import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { logger } from "@/services"
import InternalServerError from "@/errors/types/InternalServerError"
import HTTPError from "@/errors/types/HTTPError"
import { ValidateError } from "tsoa"

export const errorHandler: ErrorRequestHandler = (err: Error, _: Request, res: Response, __: NextFunction) => {
    if (err instanceof ValidateError) {
        logger.warn(err.message)
        res.status(422).json({
            status: 422,
            message: "Request does not pass validation",
            details: err.fields
        })
        return
    }
    if (err instanceof HTTPError) {
        logger.warn(err.message)
        res.status(err.status).json(err.payload)
        return
    }
    logger.warn(err.stack ?? err.message)
    const internal = new InternalServerError("Internal server error")
    res.status(internal.status).json(internal.payload)
}
