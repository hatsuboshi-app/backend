import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import { decodeSortOptions, IPaginator, IPItem, PItemFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, OperationId, Path, Query, Response, Route, Tags } from "tsoa"
import { ErrorResponse } from "@/errors/response/ErrorResponse"

@Route("p-items")
@Tags("PItem")
export class PItemController extends Controller {
    /**
     * Retrieves a paginated list of `IPItem` (JSON-serializable) objects that match an optional filter.
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `PItemFilterOptions` object.
     * @param s   String representation of a `SortOption<IPItem>[]` list.
     */
    @Get()
    @OperationId("List PItems")
    @Response<ErrorResponse<400>>(400, "Bad Request")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getMany(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IPItem>> {
        const filter: PItemFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<IPItem>[] = s ? decodeSortOptions(s) : []
        const r = await db.getPItems({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
    }

    /**
     * Retrieves a single `IPItem` (JSON-serializable) object.
     * @param id  The `id` of the `PItem` to retrieve.
     */
    @Get("{id}")
    @OperationId("Retrieve a PItem")
    @Response<ErrorResponse<404>>(404, "Not Found")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getOneById(
        @Path() id: string
    ): Promise<IPItem> {
        const r = await db.getPItemById(id)
        if (r.success) {
            return r.data.toJSON()
        } else {
            throw new NotFoundError()
        }
    }
}
