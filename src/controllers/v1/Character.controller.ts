import { db } from "@/services"
import NotFoundError from "@/errors/NotFoundError"
import { CharacterFilterOptions, decodeSortOptions, ICharacter, IPaginator, SortOption } from "@hatsuboshi/types"
import { Controller, Get, OperationId, Path, Query, Response, Route, Tags } from "tsoa"
import { ErrorResponse } from "@/errors/response/ErrorResponse"

@Route("characters")
@Tags("Character")
export class CharacterController extends Controller {
    /**
     * Retrieves a paginated list of `ICharacter` (JSON-serializable) objects that match an optional filter.
     * @param p   Page number to retrieve. (1-indexed)
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `CharacterFilterOptions` object.
     * @param s   String representation of a `SortOption<ICharacter>[]` list.
     */
    @Get()
    @OperationId("List Characters")
    @Response<ErrorResponse<400>>(400, "Bad Request")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getMany(
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
     * @param id  The `id` of the `Character` to retrieve.
     */
    @Get("{id}")
    @OperationId("Retrieve a Character")
    @Response<ErrorResponse<404>>(404, "Not Found")
    @Response<ErrorResponse<500>>(500, "Internal Server Error")
    public async getOneById(
        @Path() id: string
    ): Promise<ICharacter> {
        const r = await db.getCharacterById(id)
        if (r.success) {
            return r.data.toJSON()
        } else {
            throw new NotFoundError()
        }
    }
}
