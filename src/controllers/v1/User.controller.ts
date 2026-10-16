import { Body, Controller, Get, Patch, Path, Post, Query, Request, Response, Route, SuccessResponse, Tags } from "tsoa"
import { Request as ExpressRequest } from "express"
import { ErrorResponse, ErrorResponseWithCode } from "@/errors/response/ErrorResponse"
import { ForbiddenAuthError, UnauthorizedAuthError } from "@/errors/mapping"
import { Security } from "@/middlewares/authentication"
import { AuthContext } from "@/services/auth/auth.service"
import { IPaginator } from "@hatsuboshi/types"
import { IAdminUpdateUser, IAdminUser, IPublicUser } from "@hatsuboshi/types/auth"
import InternalServerError from "@/errors/types/InternalServerError"

@Route("users")
@Tags("User")
export class UserProfileController extends Controller {
    /**
     * Retrieves the public profile of a user.
     *
     * @summary Retrieve a user's profile
     *
     * @param id The `id` of the user to retrieve.
     */
    @Get("{id}/profile")
    @Response<ErrorResponseWithCode<404, "db/not-found">>(404, "Not Found")
    public async getUserProfile(
        @Path() id: string,
    ): Promise<IPublicUser> {
        throw new InternalServerError("Not implemented.")
    }
}

@Route("users")
@Tags("User")
@Security("user")
@Response<ErrorResponseWithCode<401, UnauthorizedAuthError>>(401, "Unauthorized")
@Response<ErrorResponseWithCode<403, ForbiddenAuthError>>(403, "Forbidden")
export class UserController extends Controller {
    /**
     * Retrieves a paginated list of all users that match an optional filter.
     *
     * @summary List users (admin)
     *
     * @param req
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of a `UserFilterOptions` object.
     * @param s   String representation of a `SortOption<IUser>[]` list.
     */
    @Get()
    @Security("bearer", ["read:user"])
    @Response<ErrorResponse<422>>(422, "Unprocessable Content")
    public async listUsers(
        @Request() req: ExpressRequest,
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IAdminUser>> {
        const ctx = req.user!

        throw new InternalServerError("Not implemented.")
    }

    /**
     * Retrieves a user.
     *
     * @summary Retrieve a user (admin)
     *
     * @param req
     * @param id The `id` of the user to retrieve.
     */
    @Get("{id}")
    @Security("bearer", ["read:user"])
    @Response<ErrorResponseWithCode<404, "db/not-found">>(404, "Not Found")
    public async getUser(
        @Request() req: ExpressRequest,
        @Path() id: string
    ): Promise<IAdminUser> {
        const ctx = req.user!

        throw new InternalServerError("Not implemented.")
    }

    /**
     * Updates a user.
     *
     * @summary Update a user (admin)
     *
     * @param req
     * @param id The `id` of the user to update.
     * @param body An `IAdminUpdateUser` object.
     */
    @Patch("{id}")
    @Security("sensitive", ["update:user"])
    @Response<ErrorResponseWithCode<404, "db/not-found">>(404, "Not Found")
    @Response<ErrorResponse<422>>(422, "Unprocessable Content")
    public async updateUser(
        @Request() req: ExpressRequest,
        @Path() id: string,
        @Body() body: IAdminUpdateUser
    ): Promise<IAdminUser> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        throw new InternalServerError("Not implemented.")
    }

    /**
     * Anonymizes (effectively deletes) a user.
     *
     * TODO
     *
     * @summary Anonymize a user (admin)
     *
     * @param req
     * @param id The `id` of the user to anonymize.
     */
    @Post("{id}/anonymize")
    @Security("sensitive", ["delete:user"])
    @SuccessResponse(204, "No Content")
    @Response<ErrorResponseWithCode<404, "db/not-found">>(404, "Not Found")
    public async anonymizeUser(
        @Request() req: ExpressRequest,
        @Path() id: string
    ): Promise<void> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        this.setStatus(204)
        throw new InternalServerError("Not implemented.")
    }
}