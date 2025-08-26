import IRepositoryService from "@/services/repository/repository.service"
import { Result, Character, DBCharacter, fail, success } from "@hatsuboshi/types"
import CharacterDataset from "@/services/repository/local/data/Character"

export default class LocalRepositoryService implements IRepositoryService {
    private readonly characters: DBCharacter[]

    constructor() {
        this.characters = CharacterDataset
    }

    async getAllCharacters(): Promise<Character[]> {
        const a: Character[] = []
        for await (const c of this.characters) {
            a.push(await Character.fromDB(c))
        }
        return a
    }

    async getCharacterById(id: string): Promise<Result<Character>> {
        const r = this.characters.find(c => c.id === id)
        if (!r) {
            return fail()
        } else {
            return success(await Character.fromDB(r))
        }
    }
}