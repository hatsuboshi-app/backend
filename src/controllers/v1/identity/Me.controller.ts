import { Body, Controller, Get, Hidden, Patch, Post, Request, Response, Route, SuccessResponse, Tags } from "tsoa"
import { Request as ExpressRequest } from "express"
import { ForbiddenEC, UnauthorizedEC, UnprocessableEC } from "@/lib/errorCodes"
import { Security } from "@/lib/auth"
import { AuthContext } from "@/services/auth/auth.service"
import { ISelfUser, IUpdateUser } from "@hatsuboshi/types/auth"
import { db } from "@/services"
import { grantedPatterns } from "@/lib/authScopes"
import ControllerError, { ErrorResponse } from "@/lib/errors"

@Route("me")
@Tags("Me")
@Security("user")
@Response<ErrorResponse<401, UnauthorizedEC>>(401, "Unauthorized")
@Response<ErrorResponse<403, ForbiddenEC>>(403, "Forbidden")
export class MeController extends Controller {
    /**
     * Retrieves the user who owns the credential the request is made with.
     *
     * @summary Retrieve the current user
     */
    @Get()
    @Security("bearer")
    public async getMe(
        @Request() req: ExpressRequest
    ): Promise<ISelfUser> {
        const ctx = req.user!
        return ctx.user.toSelfUser(grantedPatterns(ctx.user))
    }

    /**
     * Updates the user who owns the credential the request is made with.
     *
     * @summary Update the current user
     * @param req
     * @param body An `IUpdateUser` object.
     */
    @Patch()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async updateMe(
        @Request() req: ExpressRequest,
        @Body() body: IUpdateUser
    ): Promise<ISelfUser> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }
        const r = await db.updateUser(ctx.user.id, body)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toSelfUser(grantedPatterns(r.data))
    }

    /**
     * Anonymizes (effectively deletes) the user who owns the credential the request is made with.
     *
     * TODO
     *
     * @summary Anonymize the current user
     */
    @Hidden()
    @Post("anonymize")
    @Security("sensitive")
    @SuccessResponse(204, "No Content")
    public async anonymizeMe(
        @Request() req: ExpressRequest
    ): Promise<void> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }
        // TODO
        this.setStatus(204)
        throw new ControllerError("core/not-implemented")
    }
}