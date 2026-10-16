import { Body, Controller, Get, Patch, Post, Request, Response, Route, SuccessResponse, Tags } from "tsoa"
import { Request as ExpressRequest } from "express"
import { ErrorResponse, ErrorResponseWithCode } from "@/errors/response/ErrorResponse"
import { ForbiddenAuthError, UnauthorizedAuthError } from "@/errors/mapping"
import { Security } from "@/middlewares/authentication"
import { AuthContext } from "@/services/auth/auth.service"
import { ISelfUser, IUpdateUser } from "@hatsuboshi/types/auth";
import InternalServerError from "@/errors/types/InternalServerError";

@Route("me")
@Tags("Me")
@Security("user")
@Response<ErrorResponseWithCode<401, UnauthorizedAuthError>>(401, "Unauthorized")
@Response<ErrorResponseWithCode<403, ForbiddenAuthError>>(403, "Forbidden")
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

        throw new InternalServerError("Not implemented.")
    }

    /**
     * Updates the user who owns the credential the request is made with.
     *
     * @summary Update the current user
     * @param req
     * @param body An `IUpdateUser` object.
     */
    @Patch()
    @Response<ErrorResponse<422>>(422, "Unprocessable Content")
    public async updateMe(
        @Request() req: ExpressRequest,
        @Body() body: IUpdateUser
    ): Promise<ISelfUser> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        throw new InternalServerError("Not implemented.")
    }

    /**
     * Anonymizes (effectively deletes) the user who owns the credential the request is made with.
     *
     * TODO
     *
     * @summary Anonymize the current user
     */
    @Post("anonymize")
    @Security("sensitive")
    @SuccessResponse(204, "No Content")
    public async anonymizeMe(
        @Request() req: ExpressRequest
    ): Promise<void> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        this.setStatus(204)
        throw new InternalServerError("Not implemented.")
    }
}