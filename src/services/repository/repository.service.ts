import {
    AsyncPopulateMethod,
    AuditionEffect,
    AuditionTerminology,
    Character, DBAuditionEffect, DBAuditionTerminology, DBCharacter, DBPItem, DBSkill,
    PDrink,
    PIdol,
    PItem,
    Result,
    Skill,
    SupportCard
} from "@hatsuboshi/types"

export type ReferencePopulateMethods = {
    auditionEffect: AsyncPopulateMethod<DBAuditionEffect>,
    auditionTerminology: AsyncPopulateMethod<DBAuditionTerminology>,
    character: AsyncPopulateMethod<DBCharacter>,
    skill: AsyncPopulateMethod<DBSkill>,
    pItem: AsyncPopulateMethod<DBPItem>
}

export default interface IRepositoryService {
    // AuditionEffect //
    getAllAuditionEffects(): Promise<AuditionEffect[]>
    getAuditionEffectById(id: string): Promise<Result<AuditionEffect>>

    // AuditionTerminology //
    getAllAuditionTerminologies(): Promise<AuditionTerminology[]>
    getAuditionTerminologyById(id: string): Promise<Result<AuditionTerminology>>

    // Character //
    getAllCharacters(): Promise<Character[]>
    getCharacterById(id: string): Promise<Result<Character>>

    // PDrink //
    getAllPDrinks(): Promise<PDrink[]>
    getPDrinkById(id: string): Promise<Result<PDrink>>

    // PIdol //
    getAllPIdols(): Promise<PIdol[]>
    getPIdolById(id: string): Promise<Result<PIdol>>

    // PItem //
    getAllPItems(): Promise<PItem[]>
    getPItemById(id: string): Promise<Result<PItem>>

    // Skill //
    getAllSkills(): Promise<Skill[]>
    getSkillById(id: string): Promise<Result<Skill>>

    // SupportCard //
    getAllSupportCards(): Promise<SupportCard[]>
    getSupportCardById(id: string): Promise<Result<SupportCard>>
}
