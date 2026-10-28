import { db } from "@/services"
import {
    IPaginator,
    ISupportCard,
    SupportCard,
    SupportCardListQuery
} from "@hatsuboshi/types"
import { Controller, Get, Hidden, Path, Queries, Response, Route, Tags } from "tsoa"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"
import ControllerError, { ErrorResponse } from "@/lib/errors"

@Route("support-cards")
@Tags("SupportCard")
@Hidden()
export class SupportCardController extends Controller {
    /**
     * Retrieves a paginated list of `ISupportCard` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List support cards
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listSupportCards(
        @Queries() query: SupportCardListQuery
    ): Promise<IPaginator<ISupportCard>> {
        return (await db.listSupportCards(SupportCard.decodeListQuery(query))).toJSON()
    }

    /**
     * Retrieves a single `ISupportCard` (JSON-serializable) object.
     *
     * @summary Retrieve a support card
     *
     * @param id  The `id` of the `SupportCard` to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getSupportCardById(
        @Path() id: string
    ): Promise<ISupportCard> {
        const r = await db.getSupportCardById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toJSON()
    }
}