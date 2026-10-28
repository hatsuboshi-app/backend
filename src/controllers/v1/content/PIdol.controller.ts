import { db } from "@/services"
import {
    IPaginator,
    IPIdol,
    PIdol,
    PIdolListQuery
} from "@hatsuboshi/types"
import { Controller, Get, Path, Queries, Response, Route, Tags } from "tsoa"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("p-idols")
@Tags("PIdol")
export class PIdolController extends Controller {
    /**
     * Retrieves a paginated list of `IPIdol` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List P-Idols
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listPIdols(
        @Queries() query: PIdolListQuery
    ): Promise<IPaginator<IPIdol>> {
        return (await db.listPIdols(PIdol.decodeListQuery(query))).toJSON()
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