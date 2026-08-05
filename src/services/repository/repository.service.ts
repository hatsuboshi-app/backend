import {
    AsyncPopulateMethod,
    AuditionEffect, AuditionEffectFilterOptions,
    AuditionTerminology, AuditionTerminologyFilterOptions,
    Character,
    CharacterFilterOptions, DBAuditionEffect, DBAuditionTerminology, DBCharacter, DBPItem, DBSkill,
    decodeSortOptions, IAuditionEffect,
    IAuditionTerminology, ICharacter, IPDrink, IPIdol, IPItem, ISkill, ISupportCard, Paginator,
    PDrink, PDrinkFilterOptions,
    PIdol, PIdolFilterOptions,
    PItem, PItemFilterOptions,
    Result,
    Skill, SkillFilterOptions, SortOption,
    SupportCard, SupportCardFilterOptions
} from "@hatsuboshi/types"
import { Request } from "express"

export type ReferencePopulateMethods = {
    auditionEffect: AsyncPopulateMethod<DBAuditionEffect>,
    auditionTerminology: AsyncPopulateMethod<DBAuditionTerminology>,
    character: AsyncPopulateMethod<DBCharacter>,
    skill: AsyncPopulateMethod<DBSkill>,
    pItem: AsyncPopulateMethod<DBPItem>
}
export type PaginateOptions = Partial<{
    page: number
    perPage: number
}>
export type PFS<F, S> = Partial<{
    p: PaginateOptions,
    f: F,
    s: SortOption<S>[]
}>
export function parsePfs<F, S>(req: Request): PFS<F, S> {
    const page = req.query.p ? Number(req.query.p) : undefined
    const perPage = req.query.pp ? Number(req.query.pp) : undefined
    const filter = req.query.f ? JSON.parse(String(req.query.f)) as F : undefined
    const sort = req.query.s ? decodeSortOptions<S>(String(req.query.s)) : undefined
    return {
        p: page || perPage ? { page, perPage } : undefined,
        f: filter,
        s: sort
    }
}

export default interface IRepositoryService {
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
