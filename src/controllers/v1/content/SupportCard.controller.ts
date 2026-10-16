import { db } from "@/services"
import { decodeSortOptions, IPaginator, ISupportCard, SortOption, SupportCardFilterOptions } from "@hatsuboshi/types"
import { Controller, Get, Hidden, Path, Query, Response, Route, Tags } from "tsoa"
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
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `SupportCardFilterOptions` object.
     * @param s   String representation of a `SortOption<ISupportCard>[]` list.
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listSupportCards(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<ISupportCard>> {
        const filter: SupportCardFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<ISupportCard>[] = s ? decodeSortOptions(s) : []
        const r = await db.getSupportCards({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
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