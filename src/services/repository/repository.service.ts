import {
    AsyncPopulateMethod,
    AuditionEffect, AuditionEffectFilterOptions,
    AuditionTerminology, AuditionTerminologyFilterOptions,
    Character,
    CharacterFilterOptions, DBAuditionEffect, DBAuditionTerminology, DBCharacter, DBPItem, DBSkill, IAuditionEffect,
    IAuditionTerminology, ICharacter, IPDrink, IPIdol, IPItem, ISkill, ISupportCard, Paginator,
    PDrink, PDrinkFilterOptions,
    PIdol, PIdolFilterOptions,
    PItem, PItemFilterOptions,
    Result,
    Skill, SkillFilterOptions, SortOption,
    SupportCard, SupportCardFilterOptions
} from "@hatsuboshi/types"

export type ReferencePopulateMethods = {
    auditionEffect: AsyncPopulateMethod<DBAuditionEffect>,
    auditionTerminology: AsyncPopulateMethod<DBAuditionTerminology>,
    character: AsyncPopulateMethod<DBCharacter>,
    skill: AsyncPopulateMethod<DBSkill>,
    pItem: AsyncPopulateMethod<DBPItem>
}

export type FilterSortOptions<T, U> = Partial<{
    filter: U,
    sort: SortOption<T>
}>

export default interface IRepositoryService {
    // AuditionEffect //
    getAllAuditionEffects(): Promise<AuditionEffect[]>
    getAuditionEffects(o: FilterSortOptions<IAuditionEffect, AuditionEffectFilterOptions>): Promise<Paginator<AuditionEffect>>
    getAuditionEffectById(id: string): Promise<Result<AuditionEffect>>

    // AuditionTerminology //
    getAllAuditionTerminologies(): Promise<AuditionTerminology[]>
    getAuditionTerminologies(o: FilterSortOptions<IAuditionTerminology, AuditionTerminologyFilterOptions>): Promise<Paginator<AuditionTerminology>>
    getAuditionTerminologyById(id: string): Promise<Result<AuditionTerminology>>

    // Character //
    getAllCharacters(): Promise<Character[]>
    getCharacters(o: FilterSortOptions<ICharacter, CharacterFilterOptions>): Promise<Paginator<Character>>
    getCharacterById(id: string): Promise<Result<Character>>

    // PDrink //
    getAllPDrinks(): Promise<PDrink[]>
    getPDrinks(o: FilterSortOptions<IPDrink, PDrinkFilterOptions>): Promise<Paginator<PDrink>>
    getPDrinkById(id: string): Promise<Result<PDrink>>

    // PIdol //
    getAllPIdols(): Promise<PIdol[]>
    getPIdols(o: FilterSortOptions<IPIdol, PIdolFilterOptions>): Promise<Paginator<PDrink>>
    getPIdolById(id: string): Promise<Result<PIdol>>

    // PItem //
    getAllPItems(): Promise<PItem[]>
    getPItems(o: FilterSortOptions<IPItem, PItemFilterOptions>): Promise<Paginator<PItem>>
    getPItemById(id: string): Promise<Result<PItem>>

    // Skill //
    getAllSkills(): Promise<Skill[]>
    getSkills(o: FilterSortOptions<ISkill, SkillFilterOptions>): Promise<Paginator<Skill>>
    getSkillById(id: string): Promise<Result<Skill>>

    // SupportCard //
    getAllSupportCards(): Promise<SupportCard[]>
    getSupportCards(o: FilterSortOptions<ISupportCard, SupportCardFilterOptions>): Promise<Paginator<SupportCard>>
    getSupportCardById(id: string): Promise<Result<SupportCard>>
}
