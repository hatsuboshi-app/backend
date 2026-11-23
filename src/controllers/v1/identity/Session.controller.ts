import { Controller, Post, Tags, Request, Route, Response, SuccessResponse } from "tsoa"
import { Request as ExpressRequest } from "express"
import { auth, idp } from "@/services"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { AuthContext } from "@/services/auth/auth.service"
import { ForbiddenEC, UnauthorizedEC } from "@/lib/errorCodes"
import { Security } from "@/lib/auth"

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
@Response<ErrorResponse<401, UnauthorizedEC>>(401, "Unauthorized")
@Response<ErrorResponse<403, ForbiddenEC>>(403, "Forbidden")
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
            throw new ControllerError(r.error, r.message)

        const { kind, credential } = r.data
        if (kind === "api-key")
            throw new ControllerError("auth/api-key-not-allowed")
        if (kind === "session")
            throw new ControllerError("auth/session-not-allowed")

        const c = await auth.createSession(credential)
        if (!c.success)
            throw new ControllerError(c.error, c.message)
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
            throw new ControllerError(r.error, r.message)
        this.setStatus(204)
    }
}