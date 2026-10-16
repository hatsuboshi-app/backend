import { Controller, Post, Tags, Request, Route, Response, SuccessResponse } from "tsoa"
import { Request as ExpressRequest } from "express"
import { auth, idp } from "@/services"
import ServiceError from "@/errors/types/ServiceError"
import { ErrorResponseWithCode } from "@/errors/response/ErrorResponse"
import { AuthContext } from "@/services/auth/auth.service"
import { ForbiddenAuthError, UnauthorizedAuthError } from "@/errors/mapping"
import { Security } from "@/middlewares/authentication"

type NewSession = {
    /**
     * The minted session credential. Treat it as a secret & opaque string.
     */
    session: string

    /**
     * The time the session expires at, as an ISO 8601 (RFC 3339) timestamp.
     *
     * @example "2026-07-08T07:35:46.741Z"
     */
    expiresAt: string
}

@Route("sessions")
@Tags("Session")
@Response<ErrorResponseWithCode<401, UnauthorizedAuthError>>(401, "Unauthorized")
@Response<ErrorResponseWithCode<403, ForbiddenAuthError>>(403, "Forbidden")
export class SessionController extends Controller {
    /**
     * Creates a session from an ID token.
     *
     * The returned session can then be used as a bearer credential in place of the ID token to access the API, and
     * is valid for 7 days.
     *
     * The ID token (not session, nor API key) must be passed in the `Authorization` header as `Bearer [ID-token]`,
     * and have a sign-in age of less than 5 minutes.
     *
     * @summary Create a session (sign-in)
     */
    @Post()
    @SuccessResponse(201, "Created")
    public async createSession(
        @Request() req: ExpressRequest
    ): Promise<NewSession> {
        const r = auth.classify(req.headers.authorization)
        if (!r.success)
            throw new ServiceError(r.error, r.message)

        const { kind, credential } = r.data
        if (kind === "api-key")
            throw new ServiceError("auth/api-key-not-allowed")
        if (kind === "session")
            throw new ServiceError("auth/session-not-allowed")

        const c = await auth.createSession(credential)
        if (!c.success)
            throw new ServiceError(c.error, c.message)
        this.setStatus(201)
        return c.data
    }

    /**
     * Revokes all sessions and ID tokens of the signed-in user.
     *
     * This renders all sessions and ID tokens issued prior to calling this method invalid.
     *
     * @summary Revoke all sessions (sign-out everywhere)
     */
    @Post("revoke")
    @Security("user")
    @SuccessResponse(204, "No Content")
    public async revokeAllSessions(
        @Request() req: ExpressRequest
    ): Promise<void> {
        const ctx = req.user! as AuthContext & { kind: "session" | "id-token" }
        const r = await idp.revokeAllSessions(ctx.subject)
        if (!r.success)
            throw new ServiceError(r.error, r.message)
        this.setStatus(204)
    }
}