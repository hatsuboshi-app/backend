import { db } from "@/services"
import {
    IPaginator,
    ISkill, Skill,
    SkillListQuery
} from "@hatsuboshi/types"
import { Controller, Get, Path, Queries, Response, Route, Tags } from "tsoa"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"
import ControllerError, { ErrorResponse } from "@/lib/errors"

@Route("skills")
@Tags("Skill")
export class SkillController extends Controller {
    /**
     * Retrieves a paginated list of skills that match an optional filter.
     *
     * @summary List skills
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listSkills(
        @Queries() query: SkillListQuery
    ): Promise<IPaginator<ISkill>> {
        return (await db.listSkills(Skill.decodeListQuery(query))).toJSON()
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