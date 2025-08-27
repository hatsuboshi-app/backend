import HTTPError from "@/errors/HTTPError"

export default class UnauthorizedError extends HTTPError {
    constructor(message?: string) {
        super(401)
        this.message = message ?? "Unauthorized"
        this.name = this.status.toString()
    }
}