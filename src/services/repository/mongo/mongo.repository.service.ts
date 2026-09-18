import IRepositoryService, { PaginateOptions, ReferencePopulateMethods } from "@/services/repository/repository.service"
import { Collection, Db, Document, Filter, MongoClient, ServerApiVersion, WithId } from "mongodb"
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
    SupportCardFilterOptions, SortOption, DateFilterOptions, NumberFilterOptions, EnumFilterOptions,
    LocaleStringFilterOptions, IPaginator, JSONSerializable, StringFilterOptions, New
} from "@hatsuboshi/types"
import InvalidReferenceError from "@/errors/InvalidReferenceError"
import InternalServerError from "@/errors/InternalServerError"
import config from "@/config"
import {
    AuthProvider,
    DBUser,
    ISession,
    IUser,
    Session,
    SessionFilterOptions,
    User,
    UserFilterOptions
} from "@hatsuboshi/types/auth";

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
    id = "mongo"
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
    private readonly sessions: Collection
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
        user: async (id: string) => {
            const r = await this.users.findOne({ id: id })
            if (r) return <DBUser><unknown>r
            else throw new InvalidReferenceError("User", id)
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
        this.sessions = this.metaDataDb.collection("Session")
    }

    private async fetchAndConstructPaginator<T extends JSONSerializable<I>, I extends {}>({ collection, populate, filter, options, sort }: PaginationHandlerParams<T, I>): Promise<IPaginator<I>> {
        const page = (options?.page || 1) - 1
        const perPage = options?.perPage || config.defaults.pageSize
        const startIndex = page * perPage
        if (filter?.$and && filter.$and.length === 0) {
            filter = {}
        }

        // Handle Sort
        let sortObj = {}
        if (sort) {
            for (const s of sort) {
                sortObj = { ...sortObj, [s.attribute]: s.ascending ? 1 : -1 }
            }
        } else {
            sortObj =  { ...sortObj, "createdAt": 1 }
        }

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
            filter.after && rf.$and.push({ [fieldName]: { $gt: filter.after } })
            filter.before && rf.$and.push({ [fieldName]: { $lt: filter.before } })
        }
        return rf
    }
    private addNumberFilter(f: Filter<any>, fieldName: string, filter?: NumberFilterOptions): Filter<any> {
        const rf: Filter<any> = structuredClone(f)
        rf.$and = rf.$and ?? []
        if (filter) {
            filter.lte && rf.$and.push({ [fieldName]: { $lte: filter.lte } })
            filter.gte && rf.$and.push({ [fieldName]: { $gte: filter.gte } })
        }
        return rf
    }
    private addEnumFilter<E>(f: Filter<any>, fieldName: string, filter?: EnumFilterOptions<E>): Filter<any> {
        const rf: Filter<any> = structuredClone(f)
        rf.$and = rf.$and ?? []
        if (filter && filter.include) {
            rf.$and.push({ [fieldName]: { $in: filter.include }})
        } else if (filter && filter.exclude) {
            rf.$and.push({ [fieldName]: { $nin: filter.exclude }})
        }
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
                    switch (filter.method) {
                        case "regex":
                            // NOT implemented yet
                            // filter.search && rf.$and.push({
                            //     $or: [
                            //         { [`${fieldName}.ja`]: { $regex: {} } },
                            //         { [`${fieldName}.en`]: { $regex: {} } },
                            //         { [`${fieldName}.ro`]: { $regex: {} } }
                            //     ]
                            // })
                        case "simple":
                        default: {
                            filter.search && rf.$and.push({
                                $or: [
                                    { [`${fieldName}.ja`]: { $regex: filter.search, $options: "i" }},
                                    { [`${fieldName}.en`]: { $regex: filter.search, $options: "i" }},
                                    { [`${fieldName}.ro`]: { $regex: filter.search, $options: "i" }}
                                ]
                            })
                        }
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
    async getAuditionEffects(p?: PaginateOptions, f?: AuditionEffectFilterOptions, s?: SortOption<IAuditionEffect>[]): Promise<Paginator<AuditionEffect, IAuditionEffect>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        filter = this.addLocaleStringFilter(filter, "name", f?.name)
        const data = await this.fetchAndConstructPaginator<AuditionEffect, IAuditionEffect>({
            collection: this.effects,
            populate: async d => await AuditionEffect.fromDB(<any>d, this.populateMethods),
            filter: filter,
            options: p,
            sort: s
        })
        return new Paginator(AuditionEffect, data)
    }
    async getAuditionEffectById(id: string): Promise<Result<AuditionEffect>> {
        const d = await this.effects.findOne({ id: id })
        return d
            ? success(await AuditionEffect.fromDB(<DBAuditionEffect><unknown>d, this.populateMethods))
            : fail()
    }

    // AuditionTerminology //
    async getAuditionTerminologies(p?: PaginateOptions, f?: AuditionTerminologyFilterOptions, s?: SortOption<IAuditionTerminology>[]): Promise<Paginator<AuditionTerminology, IAuditionTerminology>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        filter = this.addLocaleStringFilter(filter, "name", f?.name)
        const data = await this.fetchAndConstructPaginator<AuditionTerminology, IAuditionTerminology>({
            collection: this.terminologies,
            populate: async d => await AuditionTerminology.fromDB(<any>d, this.populateMethods),
            filter: filter,
            options: p,
            sort: s
        })
        return new Paginator(AuditionTerminology, data)
    }
    async getAuditionTerminologyById(id: string): Promise<Result<AuditionTerminology>> {
        const d = await this.terminologies.findOne({ id: id })
        return d
            ? success(await AuditionTerminology.fromDB(<DBAuditionTerminology><unknown>d, this.populateMethods))
            : fail()
    }

    // Character //
    async getCharacters(p?: PaginateOptions, f?: CharacterFilterOptions, s?: SortOption<ICharacter>[]): Promise<Paginator<Character, ICharacter>> {
        let filter: Filter<any> = {}
        filter = this.addDateFilter(filter, "createdAt", f?.createdAt)
        filter = this.addDateFilter(filter, "updatedAt", f?.updatedAt)
        if (f?.name && f.name.type === "Search" && f.name.search) {
            let nameFilter: Filter<any> = {}
            const toSearch = f.name.search.split(" ")
            toSearch.forEach(s => {
                const sf: StringFilterOptions = {
                    ...<StringFilterOptions>f.name,
                    search: s
                }
                nameFilter = this.addLocaleStringFilter(nameFilter, "firstName", sf)
                nameFilter = this.addLocaleStringFilter(nameFilter, "lastName", sf)
            })
            nameFilter.$or = nameFilter.$and
            delete nameFilter.$and
            filter = this.addCustomFilter(filter, nameFilter)
        }
        if (f?.isPlayable != undefined) {
            filter = this.addCustomFilter(filter, { "isPlayable": f.isPlayable })
        }
        const data = await this.fetchAndConstructPaginator<Character, ICharacter>({
            collection: this.characters,
            populate: async d => await Character.fromDB(<any>d),
            filter: filter,
            options: p,
            sort: s
        })
        return new Paginator(Character, data)
    }
    async getCharacterById(id: string): Promise<Result<Character>> {
        const d = await this.characters.findOne({ id: id })
        return d
            ? success(await Character.fromDB(<DBCharacter><unknown>d))
            : fail()
    }

    // PDrink //
    async getPDrinks(p?: PaginateOptions, f?: PDrinkFilterOptions, s?: SortOption<IPDrink>[]): Promise<Paginator<PDrink, IPDrink>> {
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
            options: p,
            sort: s
        })
        return new Paginator(PDrink, data)
    }
    async getPDrinkById(id: string): Promise<Result<PDrink>> {
        const d = await this.drinks.findOne({ id: id })
        return d
            ? success(await PDrink.fromDB(<DBPDrink><unknown>d, this.populateMethods))
            : fail()
    }

    // PIdol //
    async getPIdols(p?: PaginateOptions, f?: PIdolFilterOptions, s?: SortOption<IPIdol>[]): Promise<Paginator<PIdol, IPIdol>> {
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
            filter = this.addCustomFilter(filter, { "primaStellaUpgrade": f.hasPrimaStellaUpgrade ? null : { $ne: null } })
        }
        if (f?.hasTrainingLv7 != undefined) {
            filter = this.addCustomFilter(filter, { "upgradeLevels.6": { $exists: f.hasTrainingLv7 }})
        }
        const data = await this.fetchAndConstructPaginator<PIdol, IPIdol>({
            collection: this.idols,
            populate: async d => await PIdol.fromDB(<any>d, this.populateMethods),
            filter: filter,
            options: p,
            sort: s
        })
        return new Paginator(PIdol, data)
    }
    async getPIdolById(id: string): Promise<Result<PIdol>> {
        const d = await this.idols.findOne({ id: id })
        return d
            ? success(await PIdol.fromDB(<DBPIdol><unknown>d, this.populateMethods))
            : fail()
    }

    // PItem //
    async getPItems(p?: PaginateOptions, f?: PItemFilterOptions, s?: SortOption<IPItem>[]): Promise<Paginator<PItem, IPItem>> {
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
            options: p,
            sort: s
        })
        return new Paginator(PItem, data)
    }
    async getPItemById(id: string): Promise<Result<PItem>> {
        const d = await this.items.findOne({ id: id })
        return d
            ? success(await PItem.fromDB(<DBPItem><unknown>d, this.populateMethods))
            : fail()
    }

    // Skill //
    async getSkills(p?: PaginateOptions, f?: SkillFilterOptions, s?: SortOption<ISkill>[]): Promise<Paginator<Skill, ISkill>> {
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
            options: p,
            sort: s
        })
        return new Paginator(Skill, data)
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

    // User //
    async getUsers(p?: PaginateOptions, f?: UserFilterOptions, s?: SortOption<IUser>[]): Promise<Paginator<User, IUser>> {
        throw new InternalServerError("Not implemented.")
    }
    async getUserById(id: string): Promise<Result<User>> {
        throw new InternalServerError("Not implemented.")
    }
    async getUserByIdentity(provider: AuthProvider, subject: string): Promise<Result<User>> {
        throw new InternalServerError("Not implemented.")
    }
    async getUserByEmail(email: string): Promise<Result<User>> {
        throw new InternalServerError("Not implemented.")
    }
    async createUser(obj: New<IUser>): Promise<Result<User>> {
        throw new InternalServerError("Not implemented.")
    }
    async updateUser(id: string, obj: Partial<New<IUser>>): Promise<Result<User>> {
        throw new InternalServerError("Not implemented.")
    }
    async deleteUser(id: string): Promise<Result<null>> {
        throw new InternalServerError("Not implemented.")
    }

    // Session //
    async getSessions(p?: PaginateOptions, f?: SessionFilterOptions, s?: SortOption<ISession>[]): Promise<Paginator<Session, ISession>> {
        throw new InternalServerError("Not implemented.")
    }
    async getUserSessions(userId: string, p?: PaginateOptions, f?: SessionFilterOptions, s?: SortOption<ISession>[]): Promise<Paginator<Session, ISession>> {
        throw new InternalServerError("Not implemented.")
    }
    async getSessionById(id: string): Promise<Result<Session>> {
        throw new InternalServerError("Not implemented.")
    }
    async getSessionByToken(token: string): Promise<Result<Session>> {
        throw new InternalServerError("Not implemented.")
    }
    async createSession(obj: New<ISession>, token: string, ip?: string): Promise<Result<Session>> {
        throw new InternalServerError("Not implemented.")
    }
    async deleteUserSessions(userId: string): Promise<Result<null>> {
        throw new InternalServerError("Not implemented.")
    }
    async deleteSession(id: string): Promise<Result<null>> {
        throw new InternalServerError("Not implemented.")
    }
}