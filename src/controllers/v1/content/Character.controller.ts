import { db } from "@/services"
import {
    Character,
    CharacterListQuery,
    ICharacter,
    IPaginator
} from "@hatsuboshi/types"
import { Controller, Get, Path, Queries, Response, Route, Tags } from "tsoa"
import ControllerError, { ErrorResponse } from "@/lib/errors"
import { NotFoundEC, UnprocessableEC } from "@/lib/errorCodes"

@Route("characters")
@Tags("Character")
export class CharacterController extends Controller {
    /**
     * Retrieves a paginated list of `ICharacter` (JSON-serializable) objects that match an optional filter.
     *
     * @summary List characters
     */
    @Get()
    @Response<ErrorResponse<422, UnprocessableEC>>(422, "Unprocessable Entity")
    public async listCharacters(
        @Queries() query: CharacterListQuery
    ): Promise<IPaginator<ICharacter>> {
        return (await db.listCharacters(Character.decodeListQuery(query))).toJSON()
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