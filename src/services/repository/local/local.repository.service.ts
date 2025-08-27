import IRepositoryService, { ReferencePopulateMethods } from "@/services/repository/repository.service"
import {
    Result,
    Character,
    fail,
    success,
    AuditionEffect,
    AuditionTerminology,
    PDrink,
    PIdol,
    PItem,
    Skill,
    SupportCard,
    DBCharacter,
    DBSkill,
    DBPItem,
    DBAuditionEffect,
    DBAuditionTerminology
} from "@hatsuboshi/types"
import CharacterDataset from "@/services/repository/local/data/Character"
import InvalidReferenceError from "@/errors/InvalidReferenceError"
import AuditionEffectDataset from "@/services/repository/local/data/AuditionEffect"
import AuditionTerminologyDataset from "@/services/repository/local/data/AuditionTerminology"
import PDrinkDataset from "@/services/repository/local/data/PDrink"
import PIdolDataset from "@/services/repository/local/data/PIdol"
import PItemDataset from "@/services/repository/local/data/PItem"
import SkillDataset from "@/services/repository/local/data/Skill"
import SupportCardDataset from "@/services/repository/local/data/SupportCard"

export default class LocalRepositoryService implements IRepositoryService {
    private readonly effects: AuditionEffect[]
    private readonly terminologies: AuditionTerminology[]
    private readonly characters: Character[]
    private readonly drinks: PDrink[]
    private readonly idols: PIdol[]
    private readonly items: PItem[]
    private readonly skills: Skill[]
    private readonly supportCards: SupportCard[]
    private readonly populateMethods: ReferencePopulateMethods = {
        auditionEffect: async (id: string): Promise<DBAuditionEffect> => {
            const r = await this.getAuditionEffectById(id)
            if (!r.success) throw new InvalidReferenceError("AuditionEffect", id)
            return r.data.toDB()
        },
        auditionTerminology: async (id: string): Promise<DBAuditionTerminology> => {
            const r = await this.getAuditionTerminologyById(id)
            if (!r.success) throw new InvalidReferenceError("AuditionTerminology", id)
            return r.data.toDB()
        },
        character: async (id: string): Promise<DBCharacter> => {
            const r = await this.getCharacterById(id)
            if (!r.success) throw new InvalidReferenceError("Character", id)
            return r.data.toDB()
        },
        skill: async (id: string): Promise<DBSkill> => {
            const r = await this.getSkillById(id)
            if (!r.success) throw new InvalidReferenceError("Skill", id)
            return r.data.toDB()
        },
        pItem: async (id: string): Promise<DBPItem> => {
            const r = await this.getPItemById(id)
            if (!r.success) throw new InvalidReferenceError("PItem", id)
            return r.data.toDB()
        },
    }

    private async init(): Promise<void> {
        for await (const e of AuditionEffectDataset) {
            this.effects.push(await AuditionEffect.fromDB(e, this.populateMethods))
        }
        for await (const t of AuditionTerminologyDataset) {
            this.terminologies.push(await AuditionTerminology.fromDB(t, this.populateMethods))
        }
        for await (const c of CharacterDataset) {
            this.characters.push(await Character.fromDB(c))
        }
        for await (const it of PItemDataset) {
            this.items.push(await PItem.fromDB(it, this.populateMethods))
        }
        for await (const s of SkillDataset) {
            this.skills.push(await Skill.fromDB(s, this.populateMethods))
        }
        for await (const d of PDrinkDataset) {
            this.drinks.push(await PDrink.fromDB(d, this.populateMethods))
        }
        for await (const id of PIdolDataset) {
            this.idols.push(await PIdol.fromDB(id, this.populateMethods))
        }
        for await (const sc of SupportCardDataset) {
            this.supportCards.push(new SupportCard())  // TODO: fix after implementation
        }
    }
    constructor() {
        this.effects = []
        this.terminologies = []
        this.characters = []
        this.drinks = []
        this.idols = []
        this.items = []
        this.skills = []
        this.supportCards = []
        this.init().then()
    }

    // AuditionEffect //
    async getAllAuditionEffects(): Promise<AuditionEffect[]> {
        return this.effects
    }
    async getAuditionEffectById(id: string): Promise<Result<AuditionEffect>> {
        const r = this.effects.find(i  => i.id == id)
        return r ? success(r) : fail()
    }

    // AuditionTerminology //
    async getAllAuditionTerminologies(): Promise<AuditionTerminology[]> {
        return this.terminologies
    }
    async getAuditionTerminologyById(id: string): Promise<Result<AuditionTerminology>> {
        const r = this.terminologies.find(i  => i.id == id)
        return r ? success(r) : fail()
    }

    // Character //
    async getAllCharacters(): Promise<Character[]> {
        return this.characters
    }
    async getCharacterById(id: string): Promise<Result<Character>> {
        const r = this.characters.find(i => i.id === id)
        return r ? success(r) : fail()
    }

    // PDrink //
    async getAllPDrinks(): Promise<PDrink[]> {
        return this.drinks
    }
    async getPDrinkById(id: string): Promise<Result<PDrink>> {
        const r = this.drinks.find(i => i.id === id)
        return r ? success(r) : fail()
    }

    // PIdol //
    async getAllPIdols(): Promise<PIdol[]> {
        return this.idols
    }
    async getPIdolById(id: string): Promise<Result<PIdol>> {
        const r = this.idols.find(i => i.id === id)
        return r ? success(r) : fail()
    }

    // PItem //
    async getAllPItems(): Promise<PItem[]> {
        return this.items
    }
    async getPItemById(id: string): Promise<Result<PItem>> {
        const r = this.items.find(i => i.id === id)
        return r ? success(r) : fail()
    }

    // Skill //
    async getAllSkills(): Promise<Skill[]> {
        return this.skills
    }
    async getSkillById(id: string): Promise<Result<Skill>> {
        const r = this.skills.find(i => i.id === id)
        return r ? success(r) : fail()
    }

    // SupportCard //
    async getAllSupportCards(): Promise<SupportCard[]> {
        return this.supportCards
    }
    async getSupportCardById(id: string): Promise<Result<SupportCard>> {
        const r = this.supportCards.find(i => i.id === id)
        return r ? success(r) : fail()
    }
}