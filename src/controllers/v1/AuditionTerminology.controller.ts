import { db } from "@/services"
import NotFoundError, { NotFoundErrorJSON } from "@/errors/NotFoundError"
import {
    AuditionTerminologyFilterOptions,
    decodeSortOptions,
    IAuditionTerminology,
    IPaginator,
    SortOption
} from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"

@Route("terminologies")
@Tags("AuditionTerminology")
export class AuditionTerminologyController extends Controller {
    /**
     * Retrieves a paginated list of `IAuditionTerminology` (JSON-serializable) objects that match an optional filter.
     * @param p   The (1-indexed) page number to retrieve.
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `AuditionTerminologyFilterOptions` object.
     * @param s   String representation of a `SortOption<IAuditionTerminology>[]` list.
     */
    @Get()
    public async getMany(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IAuditionTerminology>> {
        const filter: AuditionTerminologyFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<IAuditionTerminology>[] = s ? decodeSortOptions(s) : []
        const r = await db.getAuditionTerminologies({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
    }

    /**
     * Retrieves a single `IAuditionTerminology` (JSON-serializable) object.
     * @param id  The `id` of the `AuditionTerminology` to retrieve.
     */
    @Get("{id}")
    @Response<NotFoundErrorJSON>(404, "Not Found")
    public async getOneById(
        @Path() id: string
    ): Promise<IAuditionTerminology> {
        const r = await db.getAuditionTerminologyById(id)
        if (r.success) {
            return r.data.toJSON()
        } else {
            throw new NotFoundError()
        }
    }
}
