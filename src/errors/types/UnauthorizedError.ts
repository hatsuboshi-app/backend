import HTTPError from "@/errors/types/HTTPError"

export default class UnauthorizedError extends HTTPError<401> {
    public name = "UnauthorizedError"

    constructor(message?: string, details?: { [key: string]: any }) {
        super(401)
        this.message = message ?? "Unauthorized"
        this.details = details
    }
}
