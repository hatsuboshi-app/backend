import { db } from "@/services"
import { CharacterFilterOptions, decodeSortOptions, ICharacter, IPaginator, SortOption } from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("characters")
@Tags("Character")
export class CharacterController extends Controller {
    /**
     * Retrieves a paginated list of `ICharacter` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List characters
     *
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `CharacterFilterOptions` object.
     * @param s   String representation of a `SortOption<ICharacter>[]` list.
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listCharacters(
        @Query() p?: number,
        @Query() pp?: number,
        @Query() f?: string,
        @Query() s?: string
    ): Promise<IPaginator<ICharacter>> {
        const filter: CharacterFilterOptions = f ? JSON.parse(f) : {}
        const sort: SortOption<ICharacter>[] = s ? decodeSortOptions(s) : []
        const r = await db.getCharacters({ page: p, perPage: pp }, filter, sort)
        return r.toJSON()
    }

    /**
     * Retrieves a single `ICharacter` (JSON-serializable) object.
     *
     * @summary Retrieve a character
     *
     * @param id  The `id` of the `Character` to retrieve.
     */
    @Get("{id}")
    @Response<ErrorResponse<404, NotFoundEC>>(404, "Not Found")
    public async getCharacterById(
        @Path() id: string
    ): Promise<ICharacter> {
        const r = await db.getCharacterById(id)
        if (!r.success)
            throw new ControllerError(r.error, r.message)
        return r.data.toJSON()
    }
}