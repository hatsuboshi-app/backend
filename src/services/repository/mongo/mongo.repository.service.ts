import IRepositoryService, { PaginateOptions, ReferencePopulateMethods } from "@/services/repository/repository.service"
import { Collection, Db, MongoClient, ServerApiVersion } from "mongodb"
import {
    AuditionEffect,
    Result,
    AuditionTerminology,
    Character,
    PDrink,
    PIdol,
    PItem,
    Skill,
    SupportCard,
    fail, success, DBAuditionEffect, DBAuditionTerminology, DBCharacter, DBSkill, DBPItem, DBPIdol, DBPDrink, Paginator,
    IAuditionTerminology, AuditionTerminologyFilterOptions, IAuditionEffect, AuditionEffectFilterOptions,
    CharacterFilterOptions,
    ICharacter,
    IPDrink,
    IPIdol,
    IPItem,
    ISkill,
    ISupportCard,
    PDrinkFilterOptions,
    PIdolFilterOptions,
    PItemFilterOptions,
    SkillFilterOptions,
    SupportCardFilterOptions, SortOption
} from "@hatsuboshi/types"
import InvalidReferenceError from "@/errors/InvalidReferenceError"
import InternalServerError from "@/errors/InternalServerError"

export type MongoCredentials = {
    shared: string,
    cluster: string,
    username: string,
    password: string
}

export default class MongoRepositoryService implements IRepositoryService {
    private readonly db: Db
    private readonly effects: Collection
    private readonly terminologies: Collection
    private readonly characters: Collection
    private readonly drinks: Collection
    private readonly idols: Collection
    private readonly items: Collection
    private readonly skills: Collection
    private readonly supportCards: Collection
    private readonly populateMethods: ReferencePopulateMethods = {
        auditionEffect: async (id: string) => {
            const r = await this.effects.findOne({ id: id })
            if (r) return <DBAuditionEffect><unknown>r
            else throw new InvalidReferenceError("AuditionEffect", id)
        },
        auditionTerminology: async (id: string) => {
            const r = await this.terminologies.findOne({ id: id })
            if (r) return <DBAuditionTerminology><unknown>r
            else throw new InvalidReferenceError("AuditionTerminology", id)
        },
        character: async (id: string) => {
            const r = await this.characters.findOne({ id: id })
            if (r) return <DBCharacter><unknown>r
            else throw new InvalidReferenceError("Character", id)
        },
        skill: async (id: string) => {
            const r = await this.skills.findOne({ id: id })
            if (r) return <DBSkill><unknown>r
            else throw new InvalidReferenceError("Skill", id)
        },
        pItem: async (id: string) => {
            const r = await this.items.findOne({ id: id })
            if (r) return <DBPItem><unknown>r
            else throw new InvalidReferenceError("PItem", id)
        },
    }

    constructor({ shared, cluster, username, password }: MongoCredentials) {
        this.db = new MongoClient(
            `mongodb+srv://${username}:${password}@${cluster}.${shared}.mongodb.net/?appName=${cluster}`,
            { serverApi: ServerApiVersion.v1 }
        ).db("GameData")
        this.effects = this.db.collection("AuditionEffect")
        this.terminologies = this.db.collection("AuditionTerminology")
        this.characters = this.db.collection("Character")
        this.drinks = this.db.collection("PDrink")
        this.idols = this.db.collection("PIdol")
        this.items = this.db.collection("PItem")
        this.skills = this.db.collection("Skill")
        this.supportCards = this.db.collection("SupportCard")
    }

    // AuditionEffect //
    async getAuditionEffects(p?: PaginateOptions, f?: AuditionEffectFilterOptions, s?: SortOption<IAuditionEffect>[]): Promise<Paginator<AuditionEffect, IAuditionEffect>> {
        throw new InternalServerError("Method not implemented.")
    }
    async getAuditionEffectById(id: string): Promise<Result<AuditionEffect>> {
        const d = await this.effects.findOne({ id: id })
        return d
            ? success(await AuditionEffect.fromDB(<DBAuditionEffect><unknown>d, this.populateMethods))
            : fail()
    }

    // AuditionTerminology //
    async getAuditionTerminologies(p?: PaginateOptions, f?: AuditionTerminologyFilterOptions, s?: SortOption<IAuditionTerminology>[]): Promise<Paginator<AuditionTerminology, IAuditionTerminology>> {
        throw new InternalServerError("Method not implemented.")
    }
    async getAuditionTerminologyById(id: string): Promise<Result<AuditionTerminology>> {
        const d = await this.terminologies.findOne({ id: id })
        return d
            ? success(await AuditionTerminology.fromDB(<DBAuditionTerminology><unknown>d, this.populateMethods))
            : fail()
    }

    // Character //
    async getCharacters(p?: PaginateOptions, f?: CharacterFilterOptions, s?: SortOption<ICharacter>[]): Promise<Paginator<Character, ICharacter>> {
        throw new InternalServerError("Method not implemented.")
    }
    async getCharacterById(id: string): Promise<Result<Character>> {
        const d = await this.characters.findOne({ id: id })
        return d
            ? success(await Character.fromDB(<DBCharacter><unknown>d))
            : fail()
    }

    // PDrink //
    async getPDrinks(p?: PaginateOptions, f?: PDrinkFilterOptions, s?: SortOption<IPDrink>[]): Promise<Paginator<PDrink, IPDrink>> {
        throw new InternalServerError("Method not implemented.")
    }
    async getPDrinkById(id: string): Promise<Result<PDrink>> {
        const d = await this.drinks.findOne({ id: id })
        return d
            ? success(await PDrink.fromDB(<DBPDrink><unknown>d, this.populateMethods))
            : fail()
    }

    // PIdol //
    async getPIdols(p?: PaginateOptions, f?: PIdolFilterOptions, s?: SortOption<IPIdol>[]): Promise<Paginator<PIdol, IPIdol>> {
        throw new InternalServerError("Method not implemented.")
    }
    async getPIdolById(id: string): Promise<Result<PIdol>> {
        const d = await this.idols.findOne({ id: id })
        return d
            ? success(await PIdol.fromDB(<DBPIdol><unknown>d, this.populateMethods))
            : fail()
    }

    // PItem //
    async getPItems(p?: PaginateOptions, f?: PItemFilterOptions, s?: SortOption<IPItem>[]): Promise<Paginator<PItem, IPItem>> {
        throw new InternalServerError("Method not implemented.")
    }
    async getPItemById(id: string): Promise<Result<PItem>> {
        const d = await this.items.findOne({ id: id })
        return d
            ? success(await PItem.fromDB(<DBPItem><unknown>d, this.populateMethods))
            : fail()
    }

    // Skill //
    async getSkills(p?: PaginateOptions, f?: SkillFilterOptions, s?: SortOption<ISkill>[]): Promise<Paginator<Skill, ISkill>> {
        throw new InternalServerError("Method not implemented.")
    }
    async getSkillById(id: string): Promise<Result<Skill>> {
        const d = await this.skills.findOne({ id: id })
        return d
            ? success(await Skill.fromDB(<DBSkill><unknown>d, this.populateMethods))
            : fail()
    }

    // SupportCard //
    async getSupportCards(p?: PaginateOptions, f?: SupportCardFilterOptions, s?: SortOption<ISupportCard>[]): Promise<Paginator<SupportCard, ISupportCard>> {
        throw new InternalServerError("Method not implemented.")
    }
    async getSupportCardById(id: string): Promise<Result<SupportCard>> {
        throw new InternalServerError("Method not implemented.")
    }
}