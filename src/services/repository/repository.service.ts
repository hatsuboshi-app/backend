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
    SupportCard, SupportCardFilterOptions
} from "@hatsuboshi/types"

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

export default interface IRepositoryService {
    id: string

    // AuditionEffect //
    getAuditionEffects(p?: PaginateOptions, f?: AuditionEffectFilterOptions, s?: SortOption<IAuditionEffect>[]):
        Promise<Paginator<AuditionEffect, IAuditionEffect>>
    getAuditionEffectById(id: string):
        Promise<Result<AuditionEffect>>

    // AuditionTerminology //
    getAuditionTerminologies(p?: PaginateOptions, f?: AuditionTerminologyFilterOptions, s?: SortOption<IAuditionTerminology>[]):
        Promise<Paginator<AuditionTerminology, IAuditionTerminology>>
    getAuditionTerminologyById(id: string):
        Promise<Result<AuditionTerminology>>

    // Character //
    getCharacters(p?: PaginateOptions, f?: CharacterFilterOptions, s?: SortOption<ICharacter>[]):
        Promise<Paginator<Character, ICharacter>>
    getCharacterById(id: string):
        Promise<Result<Character>>

    // PDrink //
    getPDrinks(p?: PaginateOptions, f?: PDrinkFilterOptions, s?: SortOption<IPDrink>[]):
        Promise<Paginator<PDrink, IPDrink>>
    getPDrinkById(id: string):
        Promise<Result<PDrink>>

    // PIdol //
    getPIdols(p?: PaginateOptions, f?: PIdolFilterOptions, s?: SortOption<IPIdol>[]):
        Promise<Paginator<PIdol, IPIdol>>
    getPIdolById(id: string):
        Promise<Result<PIdol>>

    // PItem //
    getPItems(p?: PaginateOptions, f?: PItemFilterOptions, s?: SortOption<IPItem>[]):
        Promise<Paginator<PItem, IPItem>>
    getPItemById(id: string):
        Promise<Result<PItem>>

    // Skill //
    getSkills(p?: PaginateOptions, f?: SkillFilterOptions, s?: SortOption<ISkill>[]):
        Promise<Paginator<Skill, ISkill>>
    getSkillById(id: string):
        Promise<Result<Skill>>

    // SupportCard //
    getSupportCards(p?: PaginateOptions, f?: SupportCardFilterOptions, s?: SortOption<ISupportCard>[]):
        Promise<Paginator<SupportCard, ISupportCard>>
    getSupportCardById(id: string):
        Promise<Result<SupportCard>>
}
