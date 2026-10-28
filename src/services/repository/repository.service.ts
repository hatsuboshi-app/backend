import {
    Populate,
    AuditionEffect,
    AuditionTerminology,
    Character,
    DBAuditionEffect, DBAuditionTerminology, DBCharacter, DBPItem, DBSkill,
    IAuditionEffect,
    IAuditionTerminology, ICharacter, IPDrink, IPIdol, IPItem, ISkill, ISupportCard, Paginator,
    PDrink,
    PIdol,
    PItem,
    Result,
    Skill,
    SupportCard, New, ListRequest, AuditionEffectFilter, AuditionTerminologyFilter,
    CharacterFilter, PDrinkFilter, PIdolFilter, PItemFilter, SkillFilter, SupportCardFilter
} from "@hatsuboshi/types"
import {
    AuthProvider,
    DBUser,
    IUser,
    User,
    IAPIKey, APIKey, DBAPIKey, UserFilter, APIKeyFilter
} from "@hatsuboshi/types/auth"

export type ReferencePopulateMethods = {
    auditionEffect: Populate<DBAuditionEffect>,
    auditionTerminology: Populate<DBAuditionTerminology>,
    character: Populate<DBCharacter>,
    skill: Populate<DBSkill>,
    pItem: Populate<DBPItem>
}

export type PaginateOptions = Partial<{
    page: number
    perPage: number
}>

export type UserPatch = Partial<Pick<DBUser,
    | "displayName" | "displayIcon" | "disabledAt" | "description" | "roles" | "extraScopes" | "email" | "verified">>

export type APIKeyPatch = Partial<Pick<DBAPIKey,
    | "label" | "revokedAt">>

export type APIKeyCredential = { key: APIKey, secretHash: string }

export type RepositoryResult<T> = Result<T, RepositoryEC>

export type RepositoryEC = `db/${
    | "not-found"
    | "already-exists"
    | "is-referenced"
    | "bad-reference"
}`

export default interface IRepositoryService {
    //                //
    // AuditionEffect //
    //                //
    listAuditionEffects(req: ListRequest<AuditionEffectFilter, IAuditionEffect>):
        Promise<Paginator<AuditionEffect, IAuditionEffect>>

    getAuditionEffectById(id: string):
        Promise<RepositoryResult<AuditionEffect>>

    //                     //
    // AuditionTerminology //
    //                     //
    listAuditionTerminologies(req: ListRequest<AuditionTerminologyFilter, IAuditionTerminology>):
        Promise<Paginator<AuditionTerminology, IAuditionTerminology>>

    getAuditionTerminologyById(id: string):
        Promise<RepositoryResult<AuditionTerminology>>

    //           //
    // Character //
    //           //
    listCharacters(req: ListRequest<CharacterFilter, ICharacter>):
        Promise<Paginator<Character, ICharacter>>

    getCharacterById(id: string):
        Promise<RepositoryResult<Character>>

    //        //
    // PDrink //
    //        //
    listPDrinks(req: ListRequest<PDrinkFilter, IPDrink>):
        Promise<Paginator<PDrink, IPDrink>>

    getPDrinkById(id: string):
        Promise<RepositoryResult<PDrink>>

    //       //
    // PIdol //
    //       //
    listPIdols(req: ListRequest<PIdolFilter, IPIdol>):
        Promise<Paginator<PIdol, IPIdol>>

    getPIdolById(id: string):
        Promise<RepositoryResult<PIdol>>

    //       //
    // PItem //
    //       //
    listPItems(req: ListRequest<PItemFilter, IPItem>):
        Promise<Paginator<PItem, IPItem>>

    getPItemById(id: string):
        Promise<RepositoryResult<PItem>>

    //       //
    // Skill //
    //       //
    listSkills(req: ListRequest<SkillFilter, ISkill>):
        Promise<Paginator<Skill, ISkill>>

    getSkillById(id: string):
        Promise<RepositoryResult<Skill>>

    //             //
    // SupportCard //
    //             //
    listSupportCards(req: ListRequest<SupportCardFilter, ISupportCard>):
        Promise<Paginator<SupportCard, ISupportCard>>

    getSupportCardById(id: string):
        Promise<RepositoryResult<SupportCard>>

    //      //
    // User //
    //      //
    listUsers(req: ListRequest<UserFilter, IUser>):
        Promise<Paginator<User, IUser>>

    getUserById(id: string):
        Promise<RepositoryResult<User>>

    getUserByIdentity(provider: AuthProvider, subject: string):
        Promise<RepositoryResult<User>>

    getUserByEmail(email: string):
        Promise<RepositoryResult<User>>

    createUser(obj: New<DBUser>):
        Promise<RepositoryResult<User>>

    updateUser(id: string, patch: UserPatch):
        Promise<RepositoryResult<User>>

    deleteUser(id: string):
        Promise<RepositoryResult<null>>

    //        //
    // APIKey //
    //        //
    listAPIKeys(req: ListRequest<APIKeyFilter, IAPIKey>):
        Promise<Paginator<APIKey, IAPIKey>>

    getAPIKeyById(id: string):
        Promise<RepositoryResult<APIKey>>

    getAPIKeyByPrefix(prefix: string):
        Promise<RepositoryResult<APIKeyCredential>>

    createAPIKey(obj: New<DBAPIKey>):
        Promise<RepositoryResult<APIKey>>

    recordAPIKeyUse(id: string, at?: Date):
        Promise<RepositoryResult<APIKey>>

    updateAPIKey(id: string, patch: APIKeyPatch):
        Promise<RepositoryResult<APIKey>>

    deleteAPIKey(id: string):
        Promise<RepositoryResult<null>>
}
