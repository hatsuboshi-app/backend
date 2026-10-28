import IRepositoryService, {
    APIKeyCredential,
    APIKeyPatch,
    PaginateOptions,
    ReferencePopulateMethods,
    RepositoryResult,
    UserPatch
} from "@/services/repository/repository.service"
import { Collection, Db, Document, Filter, MongoClient, ServerApiVersion, WithId } from "mongodb"
import {
    AuditionEffect,
    AuditionTerminology,
    Character,
    PDrink,
    PIdol,
    PItem,
    Skill,
    SupportCard,
    fail,
    success,
    DBAuditionEffect,
    DBAuditionTerminology,
    DBCharacter,
    DBSkill,
    DBPItem,
    DBPIdol,
    DBPDrink,
    Paginator,
    IAuditionTerminology,
    IAuditionEffect,
    ICharacter,
    IPDrink,
    IPIdol,
    IPItem,
    ISkill,
    ISupportCard,
    SortOption,
    DateFilterOptions,
    NumberFilterOptions,
    EnumFilterOptions,
    LocaleStringFilterOptions,
    IPaginator,
    JSONSerializable,
    New,
    ListRequest,
    AuditionEffectFilter,
    AuditionTerminologyFilter, CharacterFilter, PDrinkFilter, PIdolFilter, PItemFilter, SkillFilter, SupportCardFilter
} from "@hatsuboshi/types"
import config from "@/lib/config"
import {
    APIKey, APIKeyFilter,
    AuthProvider, DBAPIKey,
    DBUser,
    IAPIKey,
    IUser,
    User, UserFilter,
} from "@hatsuboshi/types/auth"
import ControllerError from "@/lib/errors"

export type MongoCredentials = {
    shared: string,
    cluster: string,
    username: string,
    password: string
}

type PaginationHandlerParams<T extends JSONSerializable<I>, I extends {}> = {
    collection: Collection,
    populate: (document: WithId<Document>) => Promise<T>,
    filter?: Filter<any>,
    options?: PaginateOptions,
    sort?: SortOption<I>[]
}

export default class MongoRepositoryService implements IRepositoryService {
    private readonly gameDataDb: Db
    private readonly metaDataDb: Db
    private readonly effects: Collection
    private readonly terminologies: Collection
    private readonly characters: Collection
    private readonly drinks: Collection
    private readonly idols: Collection
    private readonly items: Collection
    private readonly skills: Collection
    private readonly supportCards: Collection

    private readonly users: Collection
    private readonly apiKeys: Collection
    private readonly populateMethods: ReferencePopulateMethods = {
        auditionEffect: async (id: string) => {
            const r = await this.effects.findOne({ id: id })
            if (r) return <DBAuditionEffect><unknown>r
            else throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "auditionEffect", id }
            )
        },
        auditionTerminology: async (id: string) => {
            const r = await this.terminologies.findOne({ id: id })
            if (r) return <DBAuditionTerminology><unknown>r
            else throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "auditionTerminology", id }
            )
        },
        character: async (id: string) => {
            const r = await this.characters.findOne({ id: id })
            if (r) return <DBCharacter><unknown>r
            else throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "character", id }
            )
        },
        skill: async (id: string) => {
            const r = await this.skills.findOne({ id: id })
            if (r) return <DBSkill><unknown>r
            else throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "skill", id }
            )
        },
        pItem: async (id: string) => {
            const r = await this.items.findOne({ id: id })
            if (r) return <DBPItem><unknown>r
            else throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "pItem", id }
            )
        }
    }

    constructor({ shared, cluster, username, password }: MongoCredentials) {
        const client = new MongoClient(
            `mongodb+srv://${username}:${password}@${cluster}.${shared}.mongodb.net/?appName=${cluster}`,
            { serverApi: ServerApiVersion.v1 }
        )
        this.gameDataDb = client.db("GameData")
        this.metaDataDb = client.db("MetaData")
        this.effects = this.gameDataDb.collection("AuditionEffect")
        this.terminologies = this.gameDataDb.collection("AuditionTerminology")
        this.characters = this.gameDataDb.collection("Character")
        this.drinks = this.gameDataDb.collection("PDrink")
        this.idols = this.gameDataDb.collection("PIdol")
        this.items = this.gameDataDb.collection("PItem")
        this.skills = this.gameDataDb.collection("Skill")
        this.supportCards = this.gameDataDb.collection("SupportCard")
        this.users = this.metaDataDb.collection("User")
        this.apiKeys = this.metaDataDb.collection("APIKey")
    }

    private async fetchAndConstructPaginator<T extends JSONSerializable<I>, I extends {}>({ collection, populate, filter, options, sort }: PaginationHandlerParams<T, I>): Promise<IPaginator<I>> {
        const page = (options?.page || 1) - 1
        const perPage = options?.perPage || config.defaults.pageSize
        const startIndex = page * perPage
        if (filter?.$and && filter.$and.length === 0) {
            filter = {}
        }

        // Handle Sort
        const sortObj: Record<string, 1 | -1> = {}
        for (const s of sort?.length ? sort : [{ attribute: "createdAt", ascending: true }]) {
            sortObj[String(s.attribute)] = s.ascending ? 1 : -1
        }
        sortObj.id ??= 1

        const [totalItems, docs] = await Promise.all([
            collection
                .countDocuments(filter ?? {}),
            collection
                .find(filter ?? {})
                .sort(sortObj)
                .skip(startIndex)
                .limit(perPage)
                .toArray()
        ])
        const data = await Promise.all(docs.map(d => populate(d).then(d => d.toJSON())))

        // Populate Fields
        return {
            data: data,
            meta: {
                currentPage: page + 1,
                pageSize: perPage,
                totalItems: totalItems,
                totalPages: Math.ceil(totalItems / perPage)
            }
        }
    }

    private addDateFilter(f: Filter<any>, fieldName: string, filter?: DateFilterOptions): Filter<any> {
        const rf: Filter<any> = structuredClone(f)
        rf.$and = rf.$and ?? []
        if (filter) {
            filter.after && rf.$and.push({ [fieldName]: { $gte: filter.after } })
            filter.before && rf.$and.push({ [fieldName]: { $lte: filter.before } })
        }
        return rf
    }

    private addNumberFilter(f: Filter<any>, fieldName: string, filter?: NumberFilterOptions): Filter<any> {
        const rf: Filter<any> = structuredClone(f)
        rf.$and = rf.$and ?? []
        if (filter) {
            filter.lte !== undefined && rf.$and.push({ [fieldName]: { $lte: filter.lte } })
            filter.gte !== undefined && rf.$and.push({ [fieldName]: { $gte: filter.gte } })
        }
        return rf
    }

    private addEnumFilter<E>(f: Filter<any>, fieldName: string, filter?: EnumFilterOptions<E>): Filter<any> {
        const rf: Filter<any> = structuredClone(f)
        rf.$and = rf.$and ?? []
        filter?.include && rf.$and.push({ [fieldName]: { $in: filter.include } })
        filter?.exclude && rf.$and.push({ [fieldName]: { $nin: filter.exclude } })
        return rf
    }

    private addLocaleStringFilter(f: Filter<any>, fieldName: string, filter?: LocaleStringFilterOptions): Filter<any> {
        const rf: Filter<any> = structuredClone(f)
        rf.$and = rf.$and ?? []
        if (filter) {
            switch (filter.type) {
                case "IncompleteLocale": {
                    rf.$and.push({
                        $or: [
                            filter.missingJa ? { $or: [ { [`${fieldName}.ja`]: null }, { [`${fieldName}.ja`]: "" }] } : undefined,
                            filter.missingEn ? { $or: [ { [`${fieldName}.en`]: null }, { [`${fieldName}.en`]: "" }] } : undefined,
                            filter.missingRo ? { $or: [ { [`${fieldName}.ro`]: null }, { [`${fieldName}.ro`]: "" }] } : undefined
                        ].filter(a => a != undefined)
                    })
                } break
                case "Search": {
                    if (filter.search) {
                        const contains = { $regex: filter.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" }
                        rf.$and.push({
                            $or: [
                                { [`${fieldName}.ja`]: contains},
                                { [`${fieldName}.en`]: contains},
                                { [`${fieldName}.ro`]: contains}
                            ]
                        })
                    }
                }
            }
        }
        return rf
    }

    private addCustomFilter(f: Filter<any>, cond?: Filter<any>): Filter<any> {
        const rf: Filter<any> = structuredClone(f)
        rf.$and = rf.$and ?? []
        cond && rf.$and.push(cond)
        return rf
    }

    // AuditionEffect //
    async listAuditionEffects({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<AuditionEffectFilter, IAuditionEffect>): Promise<Paginator<AuditionEffect, IAuditionEffect>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        filter = this.addLocaleStringFilter(filter, "name", f?.name)
        const data = await this.fetchAndConstructPaginator<AuditionEffect, IAuditionEffect>({
            collection: this.effects,
            populate: async d => await AuditionEffect.fromDB(<any>d, this.populateMethods),
            filter: filter,
            options: { page: p, perPage: pp },
            sort: s
        })
        return new Paginator(AuditionEffect, data)
    }

    async getAuditionEffectById(id: string): Promise<RepositoryResult<AuditionEffect>> {
        const d = await this.effects.findOne({ id: id })
        return d
            ? success(await AuditionEffect.fromDB(<DBAuditionEffect><unknown>d, this.populateMethods))
            : fail("db/not-found")
    }

    // AuditionTerminology //
    async listAuditionTerminologies({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<AuditionTerminologyFilter, IAuditionTerminology>): Promise<Paginator<AuditionTerminology, IAuditionTerminology>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        filter = this.addLocaleStringFilter(filter, "name", f?.name)
        const data = await this.fetchAndConstructPaginator<AuditionTerminology, IAuditionTerminology>({
            collection: this.terminologies,
            populate: async d => await AuditionTerminology.fromDB(<any>d, this.populateMethods),
            filter: filter,
            options: { page: p, perPage: pp },
            sort: s
        })
        return new Paginator(AuditionTerminology, data)
    }

    async getAuditionTerminologyById(id: string): Promise<RepositoryResult<AuditionTerminology>> {
        const d = await this.terminologies.findOne({ id: id })
        return d
            ? success(await AuditionTerminology.fromDB(<DBAuditionTerminology><unknown>d, this.populateMethods))
            : fail("db/not-found")
    }

    // Character //
    async listCharacters({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<CharacterFilter, ICharacter>): Promise<Paginator<Character, ICharacter>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        const part = (n: string, l: string) => ({ $ifNull: [`$${n}.${l}`, ""] })
        const fullName = {
            ja: { $concat: [part("lastName", "ja"), part("firstName", "ja")] },
            en: { $concat: [part("firstName", "en"), " ", part("lastName", "en"), " ", part("firstName", "en")] }
        }
        if (f?.name && f.name.type === "Search" && f.name.search) {
            const regex = f.name.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            filter = this.addCustomFilter(filter, { $expr: { $or: [
                { $regexMatch: { input: fullName.ja, regex, options: "i" } },
                { $regexMatch: { input: fullName.en, regex, options: "i" } }
            ] } })
        } else if (f?.name?.type === "IncompleteLocale") {
            const conds = [
                f.name.missingJa && { $eq: [fullName.ja, ""] },
                f.name.missingEn && { $or: ["firstName", "lastName"].map(n => ({
                        $and: [{ $ne: [part(n, "ja"), ""] }, { $eq: [part(n, "en"), ""] }]
                    })) }
            ].filter(c => !!c)
            filter = this.addCustomFilter(filter, { $expr: conds.length ? { $or: conds } : { $literal: false } })
        }
        if (f?.isPlayable != undefined) {
            filter = this.addCustomFilter(filter, { "isPlayable": f.isPlayable })
        }
        const data = await this.fetchAndConstructPaginator<Character, ICharacter>({
            collection: this.characters,
            populate: async d => await Character.fromDB(<any>d),
            filter: filter,
            options: { page: p, perPage: pp },
            sort: s
        })
        return new Paginator(Character, data)
    }

    async getCharacterById(id: string): Promise<RepositoryResult<Character>> {
        const d = await this.characters.findOne({ id: id })
        return d
            ? success(await Character.fromDB(<DBCharacter><unknown>d))
            : fail("db/not-found")
    }

    // PDrink //
    async listPDrinks({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<PDrinkFilter, IPDrink>): Promise<Paginator<PDrink, IPDrink>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        filter = this.addLocaleStringFilter(filter, "name", f?.name)
        filter = this.addEnumFilter(filter, "plan", f?.plan)
        filter = this.addEnumFilter(filter, "rarity", f?.rarity)
        filter = this.addNumberFilter(filter, "unlockLevel", f?.unlockLevel)
        const data = await this.fetchAndConstructPaginator<PDrink, IPDrink>({
            collection: this.drinks,
            populate: async d => await PDrink.fromDB(<any>d, this.populateMethods),
            filter: filter,
            options: { page: p, perPage: pp },
            sort: s
        })
        return new Paginator(PDrink, data)
    }

    async getPDrinkById(id: string): Promise<RepositoryResult<PDrink>> {
        const d = await this.drinks.findOne({ id: id })
        return d
            ? success(await PDrink.fromDB(<DBPDrink><unknown>d, this.populateMethods))
            : fail("db/not-found")
    }

    // PIdol //
    async listPIdols({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<PIdolFilter, IPIdol>): Promise<Paginator<PIdol, IPIdol>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        filter = this.addLocaleStringFilter(filter, "name", f?.name)
        filter = this.addEnumFilter(filter, "character", f?.character)
        filter = this.addEnumFilter(filter, "rarity", f?.rarity)
        filter = this.addEnumFilter(filter, "plan", f?.plan)
        if (f?.isWelfare != undefined) {
            filter = this.addCustomFilter(filter, { "isWelfare": f.isWelfare })
        }
        if (f?.hasPrimaStellaUpgrade != undefined) {
            filter = this.addCustomFilter(filter, { "primaStellaUpgrade": f.hasPrimaStellaUpgrade ? { $ne: null } : null })
        }
        if (f?.hasTrainingLv7 != undefined) {
            filter = this.addCustomFilter(filter, { "trainingLevels.6": { $exists: f.hasTrainingLv7 }})
        }
        const data = await this.fetchAndConstructPaginator<PIdol, IPIdol>({
            collection: this.idols,
            populate: async d => await PIdol.fromDB(<any>d, this.populateMethods),
            filter: filter,
            options: { page: p, perPage: pp },
            sort: s
        })
        return new Paginator(PIdol, data)
    }

    async getPIdolById(id: string): Promise<RepositoryResult<PIdol>> {
        const d = await this.idols.findOne({ id: id })
        return d
            ? success(await PIdol.fromDB(<DBPIdol><unknown>d, this.populateMethods))
            : fail("db/not-found")
    }

    // PItem //
    async listPItems({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<PItemFilter, IPItem>): Promise<Paginator<PItem, IPItem>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        filter = this.addEnumFilter(filter, "plan", f?.plan)
        filter = this.addLocaleStringFilter(filter, "name", f?.name)
        filter = this.addEnumFilter(filter, "source", f?.source)
        filter = this.addEnumFilter(filter, "rarity", f?.rarity)
        filter = this.addNumberFilter(filter, "unlockLevel", f?.unlockLevel)
        const data = await this.fetchAndConstructPaginator<PItem, IPItem>({
            collection: this.items,
            populate: async d => await PItem.fromDB(<any>d, this.populateMethods),
            filter: filter,
            options: { page: p, perPage: pp },
            sort: s
        })
        return new Paginator(PItem, data)
    }

    async getPItemById(id: string): Promise<RepositoryResult<PItem>> {
        const d = await this.items.findOne({ id: id })
        return d
            ? success(await PItem.fromDB(<DBPItem><unknown>d, this.populateMethods))
            : fail("db/not-found")
    }

    // Skill //
    async listSkills({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<SkillFilter, ISkill>): Promise<Paginator<Skill, ISkill>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        filter = this.addEnumFilter(filter, "category", f?.category)
        filter = this.addLocaleStringFilter(filter, "name", f?.name)
        filter = this.addEnumFilter(filter, "plan", f?.plan)
        filter = this.addEnumFilter(filter, "rarity", f?.rarity)
        filter = this.addEnumFilter(filter, "source", f?.source)
        filter = this.addNumberFilter(filter, "unlockLevel", f?.unlockLevel)
        if (f?.isCustomizable != undefined) {
            filter = this.addCustomFilter(filter, { "customizeOptions.0": { $exists: f.isCustomizable } })
        }
        const data = await this.fetchAndConstructPaginator<Skill, ISkill>({
            collection: this.skills,
            populate: async d => await Skill.fromDB(<any>d, this.populateMethods),
            filter: filter,
            options: { page: p, perPage: pp },
            sort: s
        })
        return new Paginator(Skill, data)
    }

    async getSkillById(id: string): Promise<RepositoryResult<Skill>> {
        const d = await this.skills.findOne({ id: id })
        return d
            ? success(await Skill.fromDB(<DBSkill><unknown>d, this.populateMethods))
            : fail("db/not-found")
    }

    // SupportCard //
    async listSupportCards({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<SupportCardFilter, ISupportCard>): Promise<Paginator<SupportCard, ISupportCard>> {
        throw new ControllerError("core/not-implemented")
    }

    async getSupportCardById(id: string): Promise<RepositoryResult<SupportCard>> {
        throw new ControllerError("core/not-implemented")
    }

    // User //
    async listUsers({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<UserFilter, IUser>): Promise<Paginator<User, IUser>> {
        throw new ControllerError("core/not-implemented")
    }

    async getUserById(id: string): Promise<RepositoryResult<User>> {
        throw new ControllerError("core/not-implemented")
    }

    async getUserByIdentity(provider: AuthProvider, subject: string): Promise<RepositoryResult<User>> {
        throw new ControllerError("core/not-implemented")
    }

    async getUserByEmail(email: string): Promise<RepositoryResult<User>> {
        throw new ControllerError("core/not-implemented")
    }

    async createUser(obj: New<DBUser>): Promise<RepositoryResult<User>> {
        throw new ControllerError("core/not-implemented")
    }

    async updateUser(id: string, patch: UserPatch): Promise<RepositoryResult<User>> {
        throw new ControllerError("core/not-implemented")
    }

    async deleteUser(id: string): Promise<RepositoryResult<null>> {
        throw new ControllerError("core/not-implemented")
    }

    // APIKey //
    async listAPIKeys({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<APIKeyFilter, IAPIKey>): Promise<Paginator<APIKey, IAPIKey>> {
        throw new ControllerError("core/not-implemented")
    }

    async getAPIKeyById(id: string): Promise<RepositoryResult<APIKey>> {
        throw new ControllerError("core/not-implemented")
    }

    async getAPIKeyByPrefix(prefix: string): Promise<RepositoryResult<APIKeyCredential>> {
        throw new ControllerError("core/not-implemented")
    }

    async createAPIKey(obj: New<DBAPIKey>): Promise<RepositoryResult<APIKey>> {
        throw new ControllerError("core/not-implemented")
    }

    async recordAPIKeyUse(id: string, at?: Date): Promise<RepositoryResult<APIKey>> {
        throw new ControllerError("core/not-implemented")
    }

    async updateAPIKey(id: string, patch: APIKeyPatch): Promise<RepositoryResult<APIKey>> {
        throw new ControllerError("core/not-implemented")
    }

    async deleteAPIKey(id: string): Promise<RepositoryResult<null>> {
        throw new ControllerError("core/not-implemented")
    }
}