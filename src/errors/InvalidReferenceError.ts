import HTTPError from "@/errors/HTTPError"

export default class InvalidReferenceError extends HTTPError<404> {
    public name = "InvalidReferenceError"

    constructor(refField: string, id: string) {
        super(404)
        this.message = `Reference to object of type ${refField} with id ${id} was not found.`
    }
}