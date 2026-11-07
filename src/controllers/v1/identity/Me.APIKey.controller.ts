import {
    Body,
    Controller,
    Get,
    Patch,
    Path,
    Post,
    Queries,
    Request,
    Response,
    Route,
    SuccessResponse,
    Tags
} from "tsoa"
import { Request as ExpressRequest } from "express"
import { ForbiddenEC, NotFoundEC, UnauthorizedEC, UnprocessableEC } from "@/lib/errorCodes"
import { isOwner, Security } from "@/lib/auth"
import { AuthContext } from "@/services/auth/auth.service"
import { IPaginator } from "@hatsuboshi/types"
import {
    IAPIKey,
    ICreatedAPIKey,
    IUpdateAPIKey,
    ICreateAPIKey,
    SelfAPIKeyListQuery, APIKey
} from "@hatsuboshi/types/auth"
import { apiKeys, db } from "@/services"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { expandScopes, grantedPatterns } from "@/lib/authScopes"

@Route("me/keys")
@Tags("APIKey")
@Security("user")
@Response<ErrorResponse<401, UnauthorizedEC>>(401, "Unauthorized")
@Response<ErrorResponse<403, ForbiddenEC>>(403, "Forbidden")
export class MyAPIKeyController extends Controller {
    /**
     * Retrieves a paginated list of all API keys belonging to the user who owns the credential
     * the request is made with, that match an optional filter.
     *
     * @summary List API keys
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listMyAPIKeys(
        @Request() req: ExpressRequest,
        @Queries() query: SelfAPIKeyListQuery,
    ): Promise<IPaginator<IAPIKey>> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }
        return (await db.listAPIKeys(APIKey.decodeListQuery({ ...query, userId: [ctx.user.id] }))).toJSON()
    }

    /**
     * Retrieves an API key belonging to the user who owns the credential the request is made with.
     *
     * @summary Retrieve an API key
     *
     * @param req
     * @param id The `id` of the API key to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getMyAPIKey(
        @Request() req: ExpressRequest,
        @Path() id: string
    ): Promise<IAPIKey> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }
        const r = await db.getAPIKeyById(id)
        if (!r.success || !isOwner(ctx, r.data))
            throw new ControllerError("db/not-found")
        return r.data.toJSON()
    }

    /**
     * Creates an API key with the user who owns the credential the request is made with as the owner.
     *
     * @summary Create an API key
     *
     * @param req
     * @param body An `ICreateAPIKey` object.
     */
    @Post()
    @Security("sensitive")
    @SuccessResponse(201, "Created")
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async createMyAPIKey(
        @Request() req: ExpressRequest,
        @Body() body: ICreateAPIKey
    ): Promise<ICreatedAPIKey> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        // check for expiry in the past
        if (body.expiresAt && (isNaN(new Date(body.expiresAt).getTime()) || new Date(body.expiresAt) <= new Date()))
            throw new ControllerError("core/validation-failed", "expiresAt is in the past, or in an invalid format")

        // check for all new key scopes owned by user
        const granted = expandScopes(grantedPatterns(ctx.user))
        const notHeld = body.scopes.filter(p => !expandScopes([p]).every(s => granted.includes(s)))
        if (notHeld.length > 0)
            throw new ControllerError("auth/insufficient-scope", undefined, { missing: notHeld })

        const r = await apiKeys.create(ctx.user, body.label, body.scopes, body.expiresAt)
        if (!r.success)
            throw new ControllerError(r.error, r.message)

        this.setStatus(201)
        return r.data
    }

    /**
     * Updates an API key belonging to the user who owns the credential the request is made with.
     *
     * @summary Update an API key
     *
     * @param req
     * @param id The `id` of the API key to update.
     * @param body An `IUpdateAPIKey` object.
     */
    @Patch("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async updateMyAPIKey(
        @Request() req: ExpressRequest,
        @Path() id: string,
        @Body() body: IUpdateAPIKey
    ): Promise<IAPIKey> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }
        const r = await db.getAPIKeyById(id)
        if (!r.success || !isOwner(ctx, r.data))
            throw new ControllerError("db/not-found")
        const u = await db.updateAPIKey(id, body)
        if (!u.success)
            throw new ControllerError(u.error, u.message)
        return u.data.toJSON()
    }

    /**
     * Revokes an API key belonging to the user who owns the credential the request is made with.
     *
     * @summary Revoke an API key
     *
     * @param req
     * @param id The `id` of the API key to revoke.
     */
    @Post("{id}/revoke")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async revokeMyAPIKey(
        @Request() req: ExpressRequest,
        @Path() id: string
    ): Promise<IAPIKey> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }
        const r = await db.getAPIKeyById(id)
        if (!r.success || !isOwner(ctx, r.data))
            throw new ControllerError("db/not-found")
        const v = await apiKeys.revoke(id)
        if (!v.success)
            throw new ControllerError(v.error, v.message)
        return v.data.toJSON()
    }
}