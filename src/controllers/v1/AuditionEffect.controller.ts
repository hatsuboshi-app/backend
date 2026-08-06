import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"
import { db } from "@/services"
import NotFoundError, { NotFoundErrorJSON } from "@/errors/NotFoundError"
import {
    AuditionEffectFilterOptions,
    decodeSortOptions,
    IAuditionEffect,
    IPaginator,
    SortOption
} from "@hatsuboshi/types"

@Route("effects")
@Tags("AuditionEffect")
export class AuditionEffectController extends Controller {
    /**
     * Retrieves a paginated list of `IAuditionEffect` (JSON-serializable) objects that match an optional filter.
     * @param p   The (1-indexed) page number to retrieve.
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `AuditionEffectFilterOptions` object.
     * @param s   String representation of a `SortOption<IAuditionEffect>[]` list.
     */
    @Get()
    public async getMany(
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
     * @param id  The `id` of the `AuditionEffect` to retrieve.
     */
    @Get("{id}")
    @Response<NotFoundErrorJSON>(404, "Not Found")
    public async getOneById(
        @Path() id: string
    ): Promise<IAuditionEffect> {
        const r = await db.getAuditionEffectById(id)
        if (r.success) {
            return r.data.toJSON()
        } else {
            throw new NotFoundError()
        }
    }
}
