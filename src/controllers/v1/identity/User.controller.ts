import {
    Body,
    Controller,
    Get,
    Hidden,
    Patch,
    Path,
    Post,
    Query,
    Request,
    Response,
    Route,
    SuccessResponse,
    Tags
} from "tsoa"
import { Request as ExpressRequest } from "express"
import { ForbiddenEC, NotFoundEC, UnauthorizedEC, UnprocessableEC } from "@/lib/errorCodes"
import { Security } from "@/lib/auth"
import { AuthContext } from "@/services/auth/auth.service"
import { decodeSortOptions, IPaginator, SortOption } from "@hatsuboshi/types"
import {
    IAdminUpdateUser,
    IAdminUser,
    IPublicUser, IUser,
    UserFilterOptions
} from "@hatsuboshi/types/auth"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { db } from "@/services"
import { expandScopes, grantedPatterns } from "@/lib/authScopes"

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
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getUserProfile(
        @Path() id: string,
    ): Promise<IPublicUser> {
        const r = await db.getUserById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toPublicUser()
    }
}

@Route("users")
@Tags("User")
@Security("user")
@Response<ErrorResponse<401, UnauthorizedEC>>(401, "Unauthorized")
@Response<ErrorResponse<403, ForbiddenEC>>(403, "Forbidden")
export class UserController extends Controller {
    /**
     * Retrieves a paginated list of all users that match an optional filter.
     *
     * @summary List users (admin)
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of a `UserFilterOptions` object.
     * @param s   String representation of a `SortOption<IUser>[]` list.
     */
    @Get()
    @Security("bearer", ["read:user"])
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listUsers(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IAdminUser>> {
        const filter: UserFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<IUser>[] = s ? decodeSortOptions(s) : []
        const pg = await db.getUsers({ page: p, perPage: pp }, filter, sort)
        return {
            ...pg.toJSON(),
            data: pg.data.map(u => u.toAdminUser(grantedPatterns(u)))
        }
    }

    /**
     * Retrieves a user.
     *
     * @summary Retrieve a user (admin)
     *
     * @param id The `id` of the user to retrieve.
     */
    @Get("{id}")
    @Security("bearer", ["read:user"])
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getUser(
        @Path() id: string
    ): Promise<IAdminUser> {
        const r = await db.getUserById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toAdminUser(grantedPatterns(r.data))
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
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async updateUser(
        @Request() req: ExpressRequest,
        @Path() id: string,
        @Body() body: IAdminUpdateUser
    ): Promise<IAdminUser> {
        // check that the user is not assigning roles / extraScopes to themselves
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }
        const updatingScope = body.roles !== undefined || body.extraScopes !== undefined
        if (id === ctx.user.id && updatingScope)
            throw new ControllerError("core/validation-failed", "Cannot update your own scopes / roles")

        const u = await db.getUserById(id)
        if (!u.success)
            throw new ControllerError(u.error, u.message)

        if (updatingScope) {
            const granted = expandScopes(grantedPatterns(ctx.user))
            const currentUserPatterns = grantedPatterns(u.data)

            // check that the target user cannot edit other users (i.e. not an admin)
            if (expandScopes(currentUserPatterns).includes("update:user"))
                throw new ControllerError("auth/insufficient-scope",
                    "Cannot update the scopes / roles of other users who have the update:user scope"
                )

            // check that the current scopes of the user are held by the user making the request
            const notHeldC = currentUserPatterns.filter(p => !expandScopes([p]).every(s => granted.includes(s)))
            if (notHeldC.length > 0)
                throw new ControllerError("auth/insufficient-scope", undefined, { missing: notHeldC })

            // check that the edited scopes of the user do not exceed that of the user making the request
            const granting = grantedPatterns({
                roles: body.roles ?? u.data.roles,
                extraScopes: body.extraScopes ?? u.data.extraScopes
            })
            const notHeldG = granting.filter(p => !expandScopes([p]).every(s => granted.includes(s)))
            if (notHeldG.length > 0)
                throw new ControllerError("auth/insufficient-scope", undefined, { missing: notHeldG })
        }

        const r = await db.updateUser(id, body)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toAdminUser(grantedPatterns(r.data))
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
    @Hidden()
    @Post("{id}/anonymize")
    @Security("sensitive", ["delete:user"])
    @SuccessResponse(204, "No Content")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async anonymizeUser(
        @Request() req: ExpressRequest,
        @Path() id: string
    ): Promise<void> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }
        // TODO
        this.setStatus(204)
        throw new ControllerError("core/not-implemented")
    }
}