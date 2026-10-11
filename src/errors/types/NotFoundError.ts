import HTTPError from "@/errors/types/HTTPError"

export default class NotFoundError extends HTTPError<404> {
    public name = "NotFoundError"

    constructor(message?: string, details?: { [key: string]: any }) {
        super(404)
        this.message = message ?? "Not Found"
        this.details = details
    }
}
