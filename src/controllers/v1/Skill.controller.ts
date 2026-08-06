import { db } from "@/services"
import NotFoundError, { NotFoundErrorJSON } from "@/errors/NotFoundError"
import { decodeSortOptions, IPaginator, ISkill, SkillFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"

@Route("skills")
@Tags("Skill")
export class SkillController extends Controller {
    /**
     * Retrieves a paginated list of `ISkill` (JSON-serializable) objects that match an optional filter.
     * @param p   The (1-indexed) page number to retrieve.
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `SkillFilterOptions` object.
     * @param s   String representation of a `SortOption<ISkill>[]` list.
     */
    @Get()
    public async getMany(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<ISkill>> {
        const filter: SkillFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<ISkill>[] = s ? decodeSortOptions(s) : []
        const r = await db.getSkills({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
    }

    /**
     * Retrieves a single `ISkill` (JSON-serializable) object.
     * @param id  The `id` of the `Skill` to retrieve.
     */
    @Get("{id}")
    @Response<NotFoundErrorJSON>(404, "Not Found")
    public async getOneById(
        @Path() id: string
    ): Promise<ISkill> {
        const r = await db.getSkillById(id)
        if (r.success) {
            return r.data.toJSON()
        } else {
            throw new NotFoundError()
        }
    }
}
