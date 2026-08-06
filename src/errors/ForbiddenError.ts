import HTTPError from "@/errors/HTTPError"

export default class ForbiddenError extends HTTPError<403> {
    public name = "ForbiddenError"

    constructor(message?: string, details?: { [key: string]: any }) {
        super(403)
        this.message = message ?? "Forbidden"
        this.details = details
    }
}
