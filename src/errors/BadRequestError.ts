import { HTTPError } from "@/errors/HTTPError"

export class BadRequestError extends HTTPError {
    constructor(message?: string) {
        super(400)
        this.message = message ?? "Bad Request"
        this.name = this.status.toString()
    }
}
