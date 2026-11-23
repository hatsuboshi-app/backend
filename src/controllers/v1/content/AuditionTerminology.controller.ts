import { db } from "@/services"
import {
    AuditionTerminology,
    AuditionTerminologyListQuery,
    IAuditionTerminology,
    IPaginator
} from "@hatsuboshi/types"
import { Controller, Get, Path, Queries, Response, Route, Tags } from "tsoa"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"
import ControllerError, { ErrorResponse } from "@/lib/errors"

@Route("terminologies")
@Tags("AuditionTerminology")
export class AuditionTerminologyController extends Controller {
    /**
     * Retrieves a paginated list of `IAuditionTerminology` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List terminologies
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listTerminologies(
        @Queries() query: AuditionTerminologyListQuery
    ): Promise<IPaginator<IAuditionTerminology>> {
        return (await db.listAuditionTerminologies(AuditionTerminology.decodeListQuery(query))).toJSON()
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