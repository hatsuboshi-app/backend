import { db } from "@/services"
import { decodeSortOptions, IPaginator, IPIdol, PIdolFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("p-idols")
@Tags("PIdol")
export class PIdolController extends Controller {
    /**
     * Retrieves a paginated list of `IPIdol` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List P-Idols
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `PIdolFilterOptions` object.
     * @param s   String representation of a `SortOption<IPIdol>[]` list.
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listPIdols(
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
     *
     * @summary Retrieve a P-Idol
     *
     * @param id  The `id` of the `PIdol` to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getPIdolById(
        @Path() id: string
    ): Promise<IPIdol> {
        const r = await db.getPIdolById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toJSON()
    }
}