import { db } from "@/services"
import NotFoundError, { NotFoundErrorJSON } from "@/errors/NotFoundError"
import { CharacterFilterOptions, decodeSortOptions, ICharacter, IPaginator, SortOption } from "@hatsuboshi/types"
import { Controller, Get, Path, Query, Response, Route, Tags } from "tsoa"

@Route("characters")
@Tags("Character")
export class CharacterController extends Controller {
    /**
     * Retrieves a paginated list of `ICharacter` (JSON-serializable) objects that match an optional filter.
     * @param p   The (1-indexed) page number to retrieve.
     * @param pp  Number of results to return per page.
     * @param f   JSON-serialized string of an `CharacterFilterOptions` object.
     * @param s   String representation of a `SortOption<ICharacter>[]` list.
     */
    @Get()
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
    @Response<NotFoundErrorJSON>(404, "Not Found")
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
