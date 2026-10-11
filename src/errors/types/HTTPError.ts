import { ErrorResponse } from "@/errors/response/ErrorResponse"

export default class HTTPError<S extends number> extends Error {
    public name = "HTTPError"
    public status: S
    public details?: { [key: string]: any }

    constructor(status: S, message?: string, details?: { [key: string]: any }) {
        super(message)
        this.status = status
        this.details = details
    }

    get payload(): ErrorResponse<S> {
        return {
            "status": this.status,
            "message": this.message,
            "details": this.details
        }
    }
}
