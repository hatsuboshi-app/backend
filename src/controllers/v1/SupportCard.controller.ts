import { db } from "@/services"
import NotFoundError, { NotFoundErrorJSON } from "@/errors/NotFoundError"
import { decodeSortOptions, IPaginator, ISupportCard, SortOption, SupportCardFilterOptions } from "@hatsuboshi/types"
import { Controller, Get, Hidden, Path, Query, Response, Route, Tags } from "tsoa"

@Route("support-cards")
@Tags("SupportCard")
@Hidden()
export class SupportCardController extends Controller {
    /**
     * Retrieves a paginated list of `ISupportCard` (JSON-serializable) objects that match an optional filter.
     * @param p   The (1-indexed) page number to retrieve.
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `SupportCardFilterOptions` object.
     * @param s   String representation of a `SortOption<ISupportCard>[]` list.
     */
    @Get()
    @Tags("Get", "List")
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
    @Response<NotFoundErrorJSON>(404, "Not Found")
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
