import { Controller, Get, Path, Post, Query, Response, Route, Tags } from "tsoa"
import { ForbiddenEC, NotFoundEC, UnauthorizedEC, UnprocessableEC } from "@/lib/errorCodes"
import { Security } from "@/lib/auth"
import { APIKeyFilterOptions, IAPIKey } from "@hatsuboshi/types/auth"
import { decodeSortOptions, IPaginator, SortOption } from "@hatsuboshi/types"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { apiKeys, db } from "@/services"

@Route("keys")
@Tags("APIKey")
@Security("user")
@Response<ErrorResponse<401, UnauthorizedEC>>(401, "Unauthorized")
@Response<ErrorResponse<403, ForbiddenEC>>(403, "Forbidden")
export class APIKeyController extends Controller {
    /**
     * Retrieves a paginated list of all API keys that match an optional filter.
     *
     * @summary List API keys (admin)
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `APIKeyFilterOptions` object.
     * @param s   String representation of a `SortOption<IAPIKey>[]` list.
     */
    @Get()
    @Security("bearer", ["read:apikey"])
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listAPIKeys(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IAPIKey>> {
        const filter: APIKeyFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<IAPIKey>[] = s ? decodeSortOptions(s) : []
        return (await db.getAPIKeys({ page: p, perPage: pp }, filter, sort)).toJSON()
    }

    /**
     * Revokes an API key.
     *
     * @summary Revoke an API key (admin)
     *
     * @param id The `id` of the API key to revoke.
     */
    @Post("{id}/revoke")
    @Security("user", ["delete:apikey"])
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async revokeAPIKey(
        @Path() id: string
    ): Promise<IAPIKey> {
        const v = await apiKeys.revoke(id)
        if (!v.success)
            throw new ControllerError(v.error, v.message)
        return v.data.toJSON()
    }
}