import IRepositoryService, { ReferencePopulateMethods } from "@/services/repository/repository.service"
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
    fail, success, DBAuditionEffect, DBAuditionTerminology, DBCharacter, DBSkill, DBPItem, DBPIdol, DBPDrink
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
    // private readonly supportCards: Collection
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
        // this.supportCards = this.db.collection("SupportCard")
    }

    // AuditionEffect //
    async getAllAuditionEffects(): Promise<AuditionEffect[]> {
        throw new InternalServerError("Method not implemented.")
    }
    async getAuditionEffectById(id: string): Promise<Result<AuditionEffect>> {
        const d = await this.effects.findOne({ id: id })
        return d
            ? success(await AuditionEffect.fromDB(<DBAuditionEffect><unknown>d, this.populateMethods))
            : fail()
    }

    // AuditionTerminology //
    async getAllAuditionTerminologies(): Promise<AuditionTerminology[]> {
        throw new InternalServerError("Method not implemented.")
    }
    async getAuditionTerminologyById(id: string): Promise<Result<AuditionTerminology>> {
        const d = await this.terminologies.findOne({ id: id })
        return d
            ? success(await AuditionTerminology.fromDB(<DBAuditionTerminology><unknown>d, this.populateMethods))
            : fail()
    }

    // Character //
    async getAllCharacters(): Promise<Character[]> {
        throw new InternalServerError("Method not implemented.")
    }
    async getCharacterById(id: string): Promise<Result<Character>> {
        const d = await this.characters.findOne({ id: id })
        return d
            ? success(await Character.fromDB(<DBCharacter><unknown>d))
            : fail()
    }

    // PDrink //
    async getAllPDrinks(): Promise<PDrink[]> {
        throw new InternalServerError("Method not implemented.")
    }
    async getPDrinkById(id: string): Promise<Result<PDrink>> {
        const d = await this.drinks.findOne({ id: id })
        return d
            ? success(await PDrink.fromDB(<DBPDrink><unknown>d, this.populateMethods))
            : fail()
    }

    // PIdol //
    async getAllPIdols(): Promise<PIdol[]> {
        throw new InternalServerError("Method not implemented.")
    }
    async getPIdolById(id: string): Promise<Result<PIdol>> {
        const d = await this.idols.findOne({ id: id })
        return d
            ? success(await PIdol.fromDB(<DBPIdol><unknown>d, this.populateMethods))
            : fail()
    }

    // PItem //
    async getAllPItems(): Promise<PItem[]> {
        throw new InternalServerError("Method not implemented.")
    }
    async getPItemById(id: string): Promise<Result<PItem>> {
        const d = await this.items.findOne({ id: id })
        return d
            ? success(await PItem.fromDB(<DBPItem><unknown>d, this.populateMethods))
            : fail()
    }

    // Skill //
    async getAllSkills(): Promise<Skill[]> {
        throw new InternalServerError("Method not implemented.")
    }
    async getSkillById(id: string): Promise<Result<Skill>> {
        const d = await this.skills.findOne({ id: id })
        return d
            ? success(await Skill.fromDB(<DBSkill><unknown>d, this.populateMethods))
            : fail()
    }

    // SupportCard //
    async getAllSupportCards(): Promise<SupportCard[]> {
        throw new InternalServerError("Method not implemented.")
    }
    async getSupportCardById(id: string): Promise<Result<SupportCard>> {
        throw new InternalServerError("Method not implemented.")
    }
}