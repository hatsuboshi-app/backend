import { Error as ErrorType, ERROR_MAPPING, HTTPErrorStatus } from "@/errors/mapping"
import HTTPError from "@/errors/types/HTTPError"
import { ErrorResponseWithCode } from "@/errors/response/ErrorResponse"

export default class ServiceError extends HTTPError<HTTPErrorStatus> {
    public name = "ServiceError"
    public error: ErrorType

    constructor(error: ErrorType, message?: string, details?: { [key: string]: any }) {
        super(ERROR_MAPPING[error], message ?? error, details)
        this.error = error
    }

    get payload(): ErrorResponseWithCode<HTTPErrorStatus, ErrorType> {
        return {
            ...super.payload,
            details: {
                ...super.payload.details,
                code: this.error
            }
        }
    }
}