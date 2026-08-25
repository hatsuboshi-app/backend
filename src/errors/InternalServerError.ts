import HTTPError from "@/errors/HTTPError"

export default class InternalServerError extends HTTPError<500> {
    public name = "InternalServerError"

    constructor(message?: string, details?: { [key: string]: any }) {
        super(500)
        this.message = message ?? "Internal Server Error"
        this.details = details
    }
}
