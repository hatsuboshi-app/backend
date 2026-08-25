import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import { decodeSortOptions, IPaginator, ISupportCard, SortOption, SupportCardFilterOptions } from "@hatsuboshi/types"
import { Controller, Get, Hidden, OperationId, Path, Query, Response, Route, Tags } from "tsoa"
import { ErrorResponse } from "@/errors/response/ErrorResponse"

@Route("support-cards")
@Tags("SupportCard")
@Hidden()
export class SupportCardController extends Controller {
    /**
     * Retrieves a paginated list of `ISupportCard` (JSON-serializable) objects that match an optional filter.
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `SupportCardFilterOptions` object.
     * @param s   String representation of a `SortOption<ISupportCard>[]` list.
     */
    @Get()
    @OperationId("List SupportCards")
    @Response<ErrorResponse<400>>(400, "Bad Request")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getMany(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<ISupportCard>> {
        const filter: SupportCardFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<ISupportCard>[] = s ? decodeSortOptions(s) : []
        const r = await db.getSupportCards({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
    }

    /**
     * Retrieves a single `ISupportCard` (JSON-serializable) object.
     * @param id  The `id` of the `SupportCard` to retrieve.
     */
    @Get("{id}")
    @OperationId("Retrieve a SupportCard")
    @Response<ErrorResponse<404>>(404, "Not Found")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getOneById(
        @Path() id: string
    ): Promise<ISupportCard> {
        const r = await db.getSupportCardById(id)
        if (r.success) {
            return r.data.toJSON()
        } else {
            throw new NotFoundError()
        }
    }
}
