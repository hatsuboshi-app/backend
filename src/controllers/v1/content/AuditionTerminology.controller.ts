import { db } from "@/services"
import {
    AuditionTerminologyFilterOptions,
    decodeSortOptions,
    IAuditionTerminology,
    IPaginator,
    SortOption
} from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"
import ControllerError, { ErrorResponse } from "@/lib/errors"

@Route("terminologies")
@Tags("AuditionTerminology")
export class AuditionTerminologyController extends Controller {
    /**
     * Retrieves a paginated list of `IAuditionTerminology` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List terminologies
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `AuditionTerminologyFilterOptions` object.
     * @param s   String representation of a `SortOption<IAuditionTerminology>[]` list.
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listTerminologies(
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
     *
     * @summary Retrieve a terminology
     *
     * @param id  The `id` of the `AuditionTerminology` to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getTerminologyById(
        @Path() id: string
    ): Promise<IAuditionTerminology> {
        const r = await db.getAuditionTerminologyById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toJSON()
    }
}