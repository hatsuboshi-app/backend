import { db } from "@/services"
import { decodeSortOptions, IPaginator, ISkill, SkillFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"
import ControllerError, { ErrorResponse } from "@/lib/errors"

@Route("skills")
@Tags("Skill")
export class SkillController extends Controller {
    /**
     * Retrieves a paginated list of skills that match an optional filter.
     *
     * @summary List skills
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `SkillFilterOptions` object.
     * @param s   String representation of a `SortOption<ISkill>[]` list.
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listSkills(
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
     * Retrieves a skill.
     *
     * @summary Retrieve a skill
     *
     * @param id  The `id` of the `Skill` to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getSkillById(
        @Path() id: string
    ): Promise<ISkill> {
        const r = await db.getSkillById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toJSON()
    }
}