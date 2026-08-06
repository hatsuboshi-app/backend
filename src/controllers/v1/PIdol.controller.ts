import { db } from "@/services"
import NotFoundError, { NotFoundErrorJSON } from "@/errors/NotFoundError"
import { decodeSortOptions, IPaginator, IPIdol, PIdolFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"

@Route("p-idols")
@Tags("PIdol")
export class PIdolController extends Controller {
    /**
     * Retrieves a paginated list of `IPIdol` (JSON-serializable) objects that match an optional filter.
     * @param p   The (1-indexed) page number to retrieve.
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `PIdolFilterOptions` object.
     * @param s   String representation of a `SortOption<IPIdol>[]` list.
     */
    @Get()
    public async getMany(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IPIdol>> {
        const filter: PIdolFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<IPIdol>[] = s ? decodeSortOptions(s) : []
        const r = await db.getPIdols({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
    }

    /**
     * Retrieves a single `IPIdol` (JSON-serializable) object.
     * @param id  The `id` of the `PIdol` to retrieve.
     */
    @Get("{id}")
    @Response<NotFoundErrorJSON>(404, "Not Found")
    public async getOneById(
        @Path() id: string
    ): Promise<IPIdol> {
        const r = await db.getPIdolById(id)
        if (r.success) {
            return r.data.toJSON()
        } else {
            throw new NotFoundError()
        }
    }
}
