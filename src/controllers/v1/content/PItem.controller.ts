import { db } from "@/services"
import { decodeSortOptions, IPaginator, IPItem, PItemFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("p-items")
@Tags("PItem")
export class PItemController extends Controller {
    /**
     * Retrieves a paginated list of `IPItem` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List P-Items
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `PItemFilterOptions` object.
     * @param s   String representation of a `SortOption<IPItem>[]` list.
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listPItems(
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
     *
     * @summary Retrieve a P-Item
     *
     * @param id  The `id` of the `PItem` to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getPItemById(
        @Path() id: string
    ): Promise<IPItem> {
        const r = await db.getPItemById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toJSON()
    }
}