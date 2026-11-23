import { Controller, Get, Path, Queries, Response, Route, Tags } from "tsoa"
import { db } from "@/services"
import {
    AuditionEffect,
    AuditionEffectListQuery,
    IAuditionEffect,
    IPaginator
} from "@hatsuboshi/types"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("effects")
@Tags("AuditionEffect")
export class AuditionEffectController extends Controller {
    /**
     * Retrieves a paginated list of `IAuditionEffect` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List effects
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listEffects(
        @Queries() query: AuditionEffectListQuery
    ): Promise<IPaginator<IAuditionEffect>> {
        return (await db.listAuditionEffects(AuditionEffect.decodeListQuery(query))).toJSON()
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