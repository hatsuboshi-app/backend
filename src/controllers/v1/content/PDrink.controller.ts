import { db } from "@/services"
import {
    IPaginator,
    IPDrink, PDrink,
    PDrinkListQuery
} from "@hatsuboshi/types"
import { Controller, Get, Path, Queries, Response, Route, Tags } from "tsoa"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("p-drinks")
@Tags("PDrink")
export class PDrinkController extends Controller {
    /**
     * Retrieves a paginated list of `IPDrink` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List P-Drinks
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listPDrinks(
        @Queries() query: PDrinkListQuery
    ): Promise<IPaginator<IPDrink>> {
        return (await db.listPDrinks(PDrink.decodeListQuery(query))).toJSON()
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
