import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import { decodeSortOptions, IPaginator, IPDrink, PDrinkFilterOptions, SortOption } from "@hatsuboshi/types"
import { Controller, Get, OperationId, Path, Query, Response, Route, Tags } from "tsoa"
import { ErrorResponse } from "@/errors/response/ErrorResponse"

@Route("p-drinks")
@Tags("PDrink")
export class PDrinkController extends Controller {
    /**
     * Retrieves a paginated list of `IPDrink` (JSON-serializable) objects that match an optional filter.
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `PDrinkFilterOptions` object.
     * @param s   String representation of a `SortOption<IPDrink>[]` list.
     */
    @Get()
    @OperationId("List PDrinks")
    @Response<ErrorResponse<400>>(400, "Bad Request")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getMany(
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
     * @param id  The `id` of the `PDrink` to retrieve.
     */
    @Get("{id}")
    @OperationId("Retrieve a PDrink")
    @Response<ErrorResponse<404>>(404, "Not Found")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getOneById(
        @Path() id: string
    ): Promise<IPDrink> {
        const r = await db.getPDrinkById(id)
        if (r.success) {
            return r.data.toJSON()
        } else {
            throw new NotFoundError()
        }
    }
}
