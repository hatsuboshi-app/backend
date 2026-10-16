import { Controller, Get, Path, Post, Query, Request, Response, Route, Tags } from "tsoa"
import { Request as ExpressRequest } from "express"
import { ErrorResponse, ErrorResponseWithCode } from "@/errors/response/ErrorResponse"
import { ForbiddenAuthError, UnauthorizedAuthError } from "@/errors/mapping"
import { Security } from "@/middlewares/authentication"
import { AuthContext } from "@/services/auth/auth.service"
import { IAPIKey } from "@hatsuboshi/types/auth";
import { IPaginator } from "@hatsuboshi/types";
import InternalServerError from "@/errors/types/InternalServerError";

@Route("keys")
@Tags("APIKey")
@Security("user")
@Response<ErrorResponseWithCode<401, UnauthorizedAuthError>>(401, "Unauthorized")
@Response<ErrorResponseWithCode<403, ForbiddenAuthError>>(403, "Forbidden")
export class APIKeyController extends Controller {
    /**
     * Retrieves a paginated list of all API keys that match an optional filter.
     *
     * @summary List API keys (admin)
     *
     * @param req
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `APIKeyFilterOptions` object.
     * @param s   String representation of a `SortOption<IAPIKey>[]` list.
     */
    @Get()
    @Security("bearer", ["read:apikey"])
    @Response<ErrorResponse<422>>(422, "Unprocessable Content")
    public async listAPIKeys(
        @Request() req: ExpressRequest,
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IAPIKey>> {
        const ctx = req.user! as AuthContext

        throw new InternalServerError("Not implemented.")
    }

    /**
     * Revokes an API key.
     *
     * @summary Revoke an API key (admin)
     *
     * @param req
     * @param id The `id` of the API key to revoke.
     */
    @Post("{id}/revoke")
    @Security("user", ["delete:apikey"])
    @Response<ErrorResponseWithCode<404, "db/not-found">>(404, "Not Found")
    public async revokeAPIKey(
        @Request() req: ExpressRequest,
        @Path() id: string
    ): Promise<IAPIKey> {
        const ctx = req.user! as AuthContext & { kind: "id-token" | "session" }

        throw new InternalServerError("Not implemented.")
    }
}