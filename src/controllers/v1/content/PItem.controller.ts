import { db } from "@/services"
import {
    IPaginator,
    IPItem, PItem,
    PItemListQuery
} from "@hatsuboshi/types"
import { Controller, Get, Path, Queries, Response, Route, Tags } from "tsoa"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("p-items")
@Tags("PItem")
export class PItemController extends Controller {
    /**
     * Retrieves a paginated list of `IPItem` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List P-Items
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listPItems(
        @Queries() query: PItemListQuery
    ): Promise<IPaginator<IPItem>> {
        return (await db.listPItems(PItem.decodeListQuery(query))).toJSON()
    }

    /**
     * Retrieves a single `IPItem` (JSON-serializable) object.
     *
     * @summary Retrieve a P-Item
     *
     * @param id  The `id` of the `PItem` to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getPItemById(
        @Path() id: string
    ): Promise<IPItem> {
        const r = await db.getPItemById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toJSON()
    }
}