import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import { decodeSortOptions, IPaginator, IPIdol, PIdolFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, OperationId, Path, Query, Response, Route, Tags } from "tsoa"
import { ErrorResponse } from "@/errors/response/ErrorResponse"

@Route("p-idols")
@Tags("PIdol")
export class PIdolController extends Controller {
    /**
     * Retrieves a paginated list of `IPIdol` (JSON-serializable) objects that match an optional filter.
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `PIdolFilterOptions` object.
     * @param s   String representation of a `SortOption<IPIdol>[]` list.
     */
    @Get()
    @OperationId("List PIdols")
    @Response<ErrorResponse<400>>(400, "Bad Request")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
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
    @OperationId("Retrieve a PIdol")
    @Response<ErrorResponse<404>>(404, "Not Found")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
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
