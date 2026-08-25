import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import { decodeSortOptions, IPaginator, ISkill, SkillFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, OperationId, Path, Query, Response, Route, Tags } from "tsoa"
import { ErrorResponse } from "@/errors/response/ErrorResponse"

@Route("skills")
@Tags("Skill")
export class SkillController extends Controller {
    /**
     * Retrieves a paginated list of `ISkill` (JSON-serializable) objects that match an optional filter.
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `SkillFilterOptions` object.
     * @param s   String representation of a `SortOption<ISkill>[]` list.
     */
    @Get()
    @OperationId("List Skills")
    @Response<ErrorResponse<400>>(400, "Bad Request")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
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
    @OperationId("Retrieve a Skill")
    @Response<ErrorResponse<404>>(404, "Not Found")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
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
