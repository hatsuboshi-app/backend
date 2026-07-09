import path from "node:path"
import { readFileSync } from "jsonfile"
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
    DBAuditionTerminology, DBPDrink, DBPIdol
} from "@hatsuboshi/types"
import InvalidReferenceError from "@/errors/InvalidReferenceError"
import InternalServerError from "@/errors/InternalServerError"

export default class LocalRepositoryService implements IRepositoryService {
    private readonly effects: DBAuditionEffect[]
    private readonly terminologies: DBAuditionTerminology[]
    private readonly characters: DBCharacter[]
    private readonly drinks: DBPDrink[]
    private readonly idols: DBPIdol[]
    private readonly items: DBPItem[]
    private readonly skills: DBSkill[]
    // private readonly supportCards: DBSupportCard[]
    private readonly populateMethods: ReferencePopulateMethods = {
        auditionEffect: async (id: string): Promise<DBAuditionEffect> => {
            const data = this.effects.find(x => x.id === id)
            if (!data) throw new InvalidReferenceError("AuditionEffect", id)
            return data
        },
        auditionTerminology: async (id: string): Promise<DBAuditionTerminology> => {
            const data = this.terminologies.find(x => x.id === id)
            if (!data) throw new InvalidReferenceError("AuditionTerminology", id)
            return data
        },
        character: async (id: string): Promise<DBCharacter> => {
            const data = this.characters.find(x => x.id === id)
            if (!data) throw new InvalidReferenceError("Character", id)
            return data
        },
        skill: async (id: string): Promise<DBSkill> => {
            const data = this.skills.find(x => x.id === id)
            if (!data) throw new InvalidReferenceError("Skill", id)
            return data
        },
        pItem: async (id: string): Promise<DBPItem> => {
            const data = this.items.find(x => x.id === id)
            if (!data) throw new InvalidReferenceError("PItem", id)
            return data
        },
    }

    constructor() {
        const dir = path.join(__dirname, "data")
        this.effects = readFileSync(path.join(dir, "AuditionEffect.json"))
        this.terminologies = readFileSync(path.join(dir, "AuditionTerminology.json"))
        this.characters = readFileSync(path.join(dir, "Character.json"))
        this.drinks = readFileSync(path.join(dir, "PDrink.json"))
        this.idols = readFileSync(path.join(dir, "PIdol.json"))
        this.items = readFileSync(path.join(dir, "PItem.json"))
        this.skills = readFileSync(path.join(dir, "Skill.json"))
        // this.supportCards = []
    }

    // AuditionEffect //
    async getAllAuditionEffects(): Promise<AuditionEffect[]> {
        const data = []
        for await (const d of this.effects)
            data.push(await AuditionEffect.fromDB(d, this.populateMethods))
        return data
    }
    async getAuditionEffectById(id: string): Promise<Result<AuditionEffect>> {
        const r = this.effects.find(i  => i.id == id)
        return r
            ? success(await AuditionEffect.fromDB(r, this.populateMethods))
            : fail()
    }

    // AuditionTerminology //
    async getAllAuditionTerminologies(): Promise<AuditionTerminology[]> {
        const data = []
        for await (const d of this.terminologies)
            data.push(await AuditionTerminology.fromDB(d, this.populateMethods))
        return data
    }
    async getAuditionTerminologyById(id: string): Promise<Result<AuditionTerminology>> {
        const r = this.terminologies.find(i  => i.id == id)
        return r
            ? success(await AuditionTerminology.fromDB(r, this.populateMethods))
            : fail()
    }

    // Character //
    async getAllCharacters(): Promise<Character[]> {
        const data = []
        for await (const d of this.characters)
            data.push(await Character.fromDB(d))
        return data
    }
    async getCharacterById(id: string): Promise<Result<Character>> {
        const r = this.characters.find(i  => i.id == id)
        return r
            ? success(await Character.fromDB(r))
            : fail()
    }

    // PDrink //
    async getAllPDrinks(): Promise<PDrink[]> {
        const data = []
        for await (const d of this.drinks)
            data.push(await PDrink.fromDB(d, this.populateMethods))
        return data
    }
    async getPDrinkById(id: string): Promise<Result<PDrink>> {
        const r = this.drinks.find(i  => i.id == id)
        return r
            ? success(await PDrink.fromDB(r, this.populateMethods))
            : fail()
    }

    // PIdol //
    async getAllPIdols(): Promise<PIdol[]> {
        const data = []
        for await (const d of this.idols)
            data.push(await PIdol.fromDB(d, this.populateMethods))
        return data
    }
    async getPIdolById(id: string): Promise<Result<PIdol>> {
        const r = this.idols.find(i  => i.id == id)
        return r
            ? success(await PIdol.fromDB(r, this.populateMethods))
            : fail()
    }

    // PItem //
    async getAllPItems(): Promise<PItem[]> {
        const data = []
        for await (const d of this.items)
            data.push(await PItem.fromDB(d, this.populateMethods))
        return data
    }
    async getPItemById(id: string): Promise<Result<PItem>> {
        const r = this.items.find(i  => i.id == id)
        return r
            ? success(await PItem.fromDB(r, this.populateMethods))
            : fail()
    }

    // Skill //
    async getAllSkills(): Promise<Skill[]> {
        const data = []
        for await (const d of this.skills)
            data.push(await Skill.fromDB(d, this.populateMethods))
        return data
    }
    async getSkillById(id: string): Promise<Result<Skill>> {
        const r = this.skills.find(i  => i.id == id)
        return r
            ? success(await Skill.fromDB(r, this.populateMethods))
            : fail()
    }

    // SupportCard //
    async getAllSupportCards(): Promise<SupportCard[]> {
        throw new InternalServerError("Not implemented.")
    }
    async getSupportCardById(id: string): Promise<Result<SupportCard>> {
        throw new InternalServerError("Not implemented.")
    }
}