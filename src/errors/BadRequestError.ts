import HTTPError from "@/errors/HTTPError"

export default class BadRequestError extends HTTPError<400> {
    public name = "BadRequestError"

    constructor(message?: string, details?: { [key: string]: any }) {
        super(400)
        this.message = message ?? "Bad Request"
        this.details = details
    }
}
