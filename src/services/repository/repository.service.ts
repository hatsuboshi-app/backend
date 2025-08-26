import { Character, Result } from "@hatsuboshi/types"

export default interface IRepositoryService {
    getAllCharacters(): Promise<Character[]>
    getCharacterById(id: string): Promise<Result<Character>>
}
