import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"
import { db } from "@/services"
import {
    AuditionEffectFilterOptions,
    decodeSortOptions,
    IAuditionEffect,
    IPaginator,
    SortOption
} from "@hatsuboshi/types"
import ControllerError, { ErrorResponse } from "@/lib/errors";
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("effects")
@Tags("AuditionEffect")
export class AuditionEffectController extends Controller {
    /**
     * Retrieves a paginated list of `IAuditionEffect` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List effects
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `AuditionEffectFilterOptions` object.
     * @param s   String representation of a `SortOption<IAuditionEffect>[]` list.
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listEffects(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IAuditionEffect>> {
        const filter: AuditionEffectFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<IAuditionEffect>[] = s ? decodeSortOptions(s) : []
        const r = await db.getAuditionEffects({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
    }

    /**
     * Retrieves a single `AuditionEffect`.
     *
     * @summary Retrieve an effect
     *
     * @param id  The `id` of the `AuditionEffect` to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getEffectById(
        @Path() id: string
    ): Promise<IAuditionEffect> {
        const r = await db.getAuditionEffectById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toJSON()
    }
}