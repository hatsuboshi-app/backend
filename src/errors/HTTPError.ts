export abstract class HTTPError extends Error {
    public status: number

    protected constructor(status: number) {
        super()
        this.status = status
        this.name = "HTTPError"
    }
}
