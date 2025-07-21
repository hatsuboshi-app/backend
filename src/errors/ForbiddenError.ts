import { HTTPError } from "@/errors/HTTPError"

export class ForbiddenError extends HTTPError {
    constructor(message?: string) {
        super(403)
        this.message = message ?? "Forbidden"
        this.name = this.status.toString()
    }
}
