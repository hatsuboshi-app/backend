import {
    Populate,
    AuditionEffect, AuditionEffectFilterOptions,
    AuditionTerminology, AuditionTerminologyFilterOptions,
    Character,
    CharacterFilterOptions, DBAuditionEffect, DBAuditionTerminology, DBCharacter, DBPItem, DBSkill,
    IAuditionEffect,
    IAuditionTerminology, ICharacter, IPDrink, IPIdol, IPItem, ISkill, ISupportCard, Paginator,
    PDrink, PDrinkFilterOptions,
    PIdol, PIdolFilterOptions,
    PItem, PItemFilterOptions,
    Result,
    Skill, SkillFilterOptions, SortOption,
    SupportCard, SupportCardFilterOptions, New
} from "@hatsuboshi/types"
import {
    AuthProvider,
    DBUser,
    IUser,
    User,
    UserFilterOptions,
    APIKeyFilterOptions, IAPIKey, APIKey
} from "@hatsuboshi/types/auth"

export type ReferencePopulateMethods = {
    auditionEffect: Populate<DBAuditionEffect>,
    auditionTerminology: Populate<DBAuditionTerminology>,
    character: Populate<DBCharacter>,
    skill: Populate<DBSkill>,
    pItem: Populate<DBPItem>,
    user: Populate<DBUser>
}

export type PaginateOptions = Partial<{
    page: number
    perPage: number
}>

export type RepositoryResult<T> = Result<T, RepositoryError>

export type RepositoryError = `db/${
    | "not-found"
    | "already-exists"
}`

export default interface IRepositoryService {
    // AuditionEffect //
    getAuditionEffects(p?: PaginateOptions, f?: AuditionEffectFilterOptions, s?: SortOption<IAuditionEffect>[]):
        Promise<Paginator<AuditionEffect, IAuditionEffect>>
    getAuditionEffectById(id: string):
        Promise<RepositoryResult<AuditionEffect>>

    // AuditionTerminology //
    getAuditionTerminologies(p?: PaginateOptions, f?: AuditionTerminologyFilterOptions, s?: SortOption<IAuditionTerminology>[]):
        Promise<Paginator<AuditionTerminology, IAuditionTerminology>>
    getAuditionTerminologyById(id: string):
        Promise<RepositoryResult<AuditionTerminology>>

    // Character //
    getCharacters(p?: PaginateOptions, f?: CharacterFilterOptions, s?: SortOption<ICharacter>[]):
        Promise<Paginator<Character, ICharacter>>
    getCharacterById(id: string):
        Promise<RepositoryResult<Character>>

    // PDrink //
    getPDrinks(p?: PaginateOptions, f?: PDrinkFilterOptions, s?: SortOption<IPDrink>[]):
        Promise<Paginator<PDrink, IPDrink>>
    getPDrinkById(id: string):
        Promise<RepositoryResult<PDrink>>

    // PIdol //
    getPIdols(p?: PaginateOptions, f?: PIdolFilterOptions, s?: SortOption<IPIdol>[]):
        Promise<Paginator<PIdol, IPIdol>>
    getPIdolById(id: string):
        Promise<RepositoryResult<PIdol>>

    // PItem //
    getPItems(p?: PaginateOptions, f?: PItemFilterOptions, s?: SortOption<IPItem>[]):
        Promise<Paginator<PItem, IPItem>>
    getPItemById(id: string):
        Promise<RepositoryResult<PItem>>

    // Skill //
    getSkills(p?: PaginateOptions, f?: SkillFilterOptions, s?: SortOption<ISkill>[]):
        Promise<Paginator<Skill, ISkill>>
    getSkillById(id: string):
        Promise<RepositoryResult<Skill>>

    // SupportCard //
    getSupportCards(p?: PaginateOptions, f?: SupportCardFilterOptions, s?: SortOption<ISupportCard>[]):
        Promise<Paginator<SupportCard, ISupportCard>>
    getSupportCardById(id: string):
        Promise<RepositoryResult<SupportCard>>

    // User //
    getUsers(p?: PaginateOptions, f?: UserFilterOptions, s?: SortOption<IUser>[]):
        Promise<Paginator<User, IUser>>
    getUserById(id: string):
        Promise<RepositoryResult<User>>
    getUserByIdentity(provider: AuthProvider, subject: string):
        Promise<RepositoryResult<User>>
    getUserByEmail(email: string):
        Promise<RepositoryResult<User>>
    createUser(obj: New<IUser>):
        Promise<RepositoryResult<User>>
    updateUser(id: string, obj: Partial<New<IUser>>):
        Promise<RepositoryResult<User>>
    deleteUser(id: string):
        Promise<RepositoryResult<null>>

    // APIKey //
    getAPIKeys(p?: PaginateOptions, f?: APIKeyFilterOptions, s?: SortOption<IAPIKey>[]):
        Promise<Paginator<APIKey, IAPIKey>>
    getAPIKeyById(id: string):
        Promise<RepositoryResult<APIKey>>
    getAPIKeyByPrefix(prefix: string):
        Promise<RepositoryResult<APIKey>>
    createAPIKey(obj: New<IAPIKey>, secretHash: string):
        Promise<RepositoryResult<APIKey>>
    updateAPIKey(id: string, obj: Partial<IAPIKey>):
        Promise<RepositoryResult<APIKey>>
    deleteAPIKey(id: string):
        Promise<RepositoryResult<null>>
}
