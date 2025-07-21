import { HTTPError } from "@/errors/HTTPError"

export class NotFoundError extends HTTPError {
    constructor(message?: string) {
        super(404)
        this.message = message ?? "Not Found"
        this.name = this.status.toString()
    }
}
