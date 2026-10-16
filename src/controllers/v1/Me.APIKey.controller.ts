import { Body, Controller, Get, Patch, Path, Post, Query, Request, Response, Route, SuccessResponse, Tags } from "tsoa"
import { Request as ExpressRequest } from "express"
import { ErrorResponse, ErrorResponseWithCode } from "@/errors/response/ErrorResponse"
import { ForbiddenAuthError, UnauthorizedAuthError } from "@/errors/mapping"
import { Security } from "@/middlewares/authentication"
import { AuthContext } from "@/services/auth/auth.service"
import { IPaginator } from "@hatsuboshi/types"
import { IAPIKey, ICreatedAPIKey, IUpdateAPIKey, ICreateAPIKey } from "@hatsuboshi/types/auth"
import InternalServerError from "@/errors/types/InternalServerError"

@Route("me/keys")
@Tags("APIKey")
@Security("user")
@Response<ErrorResponseWithCode<401, UnauthorizedAuthError>>(401, "Unauthorized")
@Response<ErrorResponseWithCode<403, ForbiddenAuthError>>(403, "Forbidden")
export class MyAPIKeyController extends Controller {
    /**
     * Retrieves a paginated list of all API keys belonging to
     * the user who owns the credential the request is made with,
     * that match an optional filter.
     *
     * @summary List API keys
     *
     * @param req
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `APIKeyFilterOptions` object.
     * @param s   String representation of a `SortOption<IAPIKey>[]` list.
     */
    @Get()
    @Response<ErrorResponse<422>>(422, "Unprocessable Content")
    public async listMyAPIKeys(
        @Request() req: ExpressRequest,
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IAPIKey>> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        throw new InternalServerError("Not implemented.")
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
    @Response<ErrorResponseWithCode<404, "db/not-found">>(404, "Not Found")
    public async getMyAPIKey(
        @Request() req: ExpressRequest,
        @Path() id: string
    ): Promise<IAPIKey> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        throw new InternalServerError("Not implemented.")
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
    @Response<ErrorResponse<422>>(422, "Unprocessable Content")
    public async createMyAPIKey(
        @Request() req: ExpressRequest,
        @Body() body: ICreateAPIKey
    ): Promise<ICreatedAPIKey> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        this.setStatus(201)
        throw new InternalServerError("Not implemented.")
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
    @Response<ErrorResponseWithCode<404, "db/not-found">>(404, "Not Found")
    @Response<ErrorResponse<422>>(422, "Unprocessable Content")
    public async updateMyAPIKey(
        @Request() req: ExpressRequest,
        @Path() id: string,
        @Body() body: IUpdateAPIKey
    ): Promise<IAPIKey> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        throw new InternalServerError("Not implemented.")
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
    @Response<ErrorResponseWithCode<404, "db/not-found">>(404, "Not Found")
    public async revokeMyAPIKey(
        @Request() req: ExpressRequest,
        @Path() id: string
    ): Promise<IAPIKey> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        throw new InternalServerError("Not implemented.")
    }
}