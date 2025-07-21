import { HTTPError } from "@/errors/HTTPError";

export class InternalServerError extends HTTPError {
    constructor(message?: string) {
        super(500)
        this.message = message ?? "Internal Server Error"
        this.name = this.status.toString()
    }
}
