import { db } from "@/services"
import { decodeSortOptions, IPaginator, IPDrink, PDrinkFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("p-drinks")
@Tags("PDrink")
export class PDrinkController extends Controller {
    /**
     * Retrieves a paginated list of `IPDrink` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List P-Drinks
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `PDrinkFilterOptions` object.
     * @param s   String representation of a `SortOption<IPDrink>[]` list.
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listPDrinks(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<IPDrink>> {
        const filter: PDrinkFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<IPDrink>[] = s ? decodeSortOptions(s) : []
        const r = await db.getPDrinks({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
    }

    /**
     * Retrieves a single `IPDrink` (JSON-serializable) object.
     *
     * @summary Retrieve a P-Drink
     *
     * @param id  The `id` of the `PDrink` to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getPDrinkById(
        @Path() id: string
    ): Promise<IPDrink> {
        const r = await db.getPDrinkById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toJSON()
    }
}
