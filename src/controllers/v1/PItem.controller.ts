import { db } from "@/services"
import NotFoundError, { NotFoundErrorJSON } from "@/errors/NotFoundError"
import { decodeSortOptions, IPaginator, IPItem, PItemFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"

@Route("p-items")
@Tags("PItem")
export class PItemController extends Controller {
    /**
     * Retrieves a paginated list of `IPItem` (JSON-serializable) objects that match an optional filter.
     * @param p   The (1-indexed) page number to retrieve.
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `PItemFilterOptions` object.
     * @param s   String representation of a `SortOption<IPItem>[]` list.
     */
    @Get()
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
    @Response<NotFoundErrorJSON>(404, "Not Found")
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
