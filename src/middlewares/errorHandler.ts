import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { logger } from "@/services"
import { ValidateError } from "tsoa"
import ControllerError from "@/lib/errors"

export const errorHandler: ErrorRequestHandler = (err: Error, _: Request, res: Response, __: NextFunction) => {
    let toHandle: ControllerError

    // regular controller error
    if (err instanceof ControllerError) {
        toHandle = err
    }

    // tsoa validate error
    else if (err instanceof ValidateError) {
        toHandle = new ControllerError("core/validation-failed", "Request does not pass validation", err.fields)
    }

    // express json parse error
    else if ((err as any).type === "entity.parse.failed") {
        toHandle = new ControllerError("core/invalid-body", "Body is not valid JSON")
    }

    // all other errors
    else {
        toHandle = new ControllerError("core/internal-error", "Something went wrong")
        logger.warn(err.stack)
    }

    logger.warn(toHandle.message)
    res.status(toHandle.status).json(toHandle.payload)
}