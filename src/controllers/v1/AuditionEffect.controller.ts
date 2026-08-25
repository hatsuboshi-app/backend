import { Controller, Get, OperationId, Path, Query, Response, Route, Tags } from "tsoa"
import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import {
    AuditionEffectFilterOptions,
    decodeSortOptions,
    IAuditionEffect,
    IPaginator,
    SortOption
} from "@hatsuboshi/types"
import { ErrorResponse } from "@/errors/response/ErrorResponse"

@Route("effects")
@Tags("AuditionEffect")
export class AuditionEffectController extends Controller {
    /**
     * Retrieves a paginated list of `IAuditionEffect` (JSON-serializable) objects that match an optional filter.
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `AuditionEffectFilterOptions` object.
     * @param s   String representation of a `SortOption<IAuditionEffect>[]` list.
     */
    @Get()
    @OperationId("List AuditionEffects")
    @Response<ErrorResponse<400>>(400, "Bad Request")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getMany(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IAuditionEffect>> {
        const filter: AuditionEffectFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<IAuditionEffect>[] = s ? decodeSortOptions(s) : []
        const r = await db.getAuditionEffects({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
    }

    /**
     * Retrieves a single `AuditionEffect`.
     * @param id  The `id` of the `AuditionEffect` to retrieve.
     */
    @Get("{id}")
    @OperationId("Retrieve an AuditionEffect")
    @Response<ErrorResponse<404>>(404, "Not Found")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getOneById(
        @Path() id: string
    ): Promise<IAuditionEffect> {
        const r = await db.getAuditionEffectById(id)
        if (r.success) {
            return r.data.toJSON()
        } else {
            throw new NotFoundError()
        }
    }
}
