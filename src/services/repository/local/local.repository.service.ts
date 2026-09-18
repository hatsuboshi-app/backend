import path from "node:path"
import { readFileSync } from "jsonfile"
import IRepositoryService, {
    PaginateOptions,
    ReferencePopulateMethods
} from "@/services/repository/repository.service"
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
    DBAuditionTerminology, DBPDrink, DBPIdol,
    AuditionEffectFilterOptions,
    AuditionTerminologyFilterOptions,
    CharacterFilterOptions,
    IAuditionEffect,
    IAuditionTerminology,
    ICharacter,
    IPDrink,
    IPIdol,
    IPItem,
    ISkill,
    ISupportCard,
    Paginator,
    PDrinkFilterOptions,
    PIdolFilterOptions,
    PItemFilterOptions,
    SkillFilterOptions,
    SupportCardFilterOptions, DBSupportCard, LocaleString, LocaleStringWithRomaji, LocaleStringFilterOptions,
    DateFilterOptions, SortOption, IPaginator, EnumFilterOptions, NumberFilterOptions, New, SimpleStringFilterOptions,
    IPersistentObject
} from "@hatsuboshi/types"
import InvalidReferenceError from "@/errors/InvalidReferenceError"
import InternalServerError from "@/errors/InternalServerError"
import config from "@/config"
import {
    AuthProvider,
    DBSession,
    DBUser,
    ISession,
    IUser,
    Session,
    SessionFilterOptions,
    User,
    UserFilterOptions
} from "@hatsuboshi/types/auth"
import { HASH_FUNCTION, SESSION_REFRESH_TIME } from "@/consts"

type LocaleStringFieldOptions = { field: LocaleStringWithRomaji, hasRom: true } | { field: LocaleString, hasRom: false }

export default class LocalRepositoryService implements IRepositoryService {
    id = "local"

    private readonly effects: DBAuditionEffect[]
    private readonly terminologies: DBAuditionTerminology[]
    private readonly characters: DBCharacter[]
    private readonly drinks: DBPDrink[]
    private readonly idols: DBPIdol[]
    private readonly items: DBPItem[]
    private readonly skills: DBSkill[]
    private readonly supportCards: DBSupportCard[]
    private readonly users: DBUser[]
    private readonly sessions: DBSession[]
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
        user: async (id: string): Promise<DBUser> => {
            const data = this.users.find(x => x.id === id)
            if (!data) throw new InvalidReferenceError("User", id)
            return data
        }
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
        this.supportCards = []
        this.users = readFileSync(path.join(dir, "User.json"))
        this.sessions = []
    }

    private constructPaginator<T extends {}>(data: T[], options?: PaginateOptions): IPaginator<T> {
        const page = (options?.page || 1) - 1
        const perPage = options?.perPage || config.defaults.pageSize
        const startIndex = page * perPage
        const endIndex = startIndex + perPage
        return {
            data: data.slice(startIndex, endIndex),
            meta: {
                currentPage: page + 1,
                pageSize: perPage,
                totalItems: data.length,
                totalPages: Math.ceil(data.length / perPage)
            }
        }
    }

    private getNewId(): string {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
        const len = 8
        let id = "";
        for (let i = 0; i < len; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id
    }

    private getNewObj(): IPersistentObject {
        return {
            id: this.getNewId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    }

    private handleDateFilter(field: string, filter?: DateFilterOptions): boolean {
        if (!filter) return true
        let isMatch = true
        if (filter.before) {
            const d1 = new Date(field)
            const d2 = new Date(filter.before)
            isMatch = d1 <= d2  // false if d1 (field) is after d2 (filter), true if d1 (field) is before d2 (filter)
        }
        if (filter.after) {
            const d1 = new Date(field)
            const d2 = new Date(filter.after)
            isMatch = d1 >= d2  // false if d1 (field) is before d2 (filter), true if d1 (field) is after d2 (filter)
        }
        return isMatch
    }

    private handleNumberFilter(field: number, filter?: NumberFilterOptions): boolean {
        if (!filter) return true
        const { gte, lte } = filter
        if (gte !== undefined && field < gte) return false  // false if gte is defined and field is less than gte
        return !(lte !== undefined && field > lte)  // false if lte is defined and field is larger than lte
    }

    private handleLocaleStringFilter({ field, hasRom }: LocaleStringFieldOptions, filter?: LocaleStringFilterOptions): boolean {
        if (!filter) return true
        switch (filter.type) {
            case "IncompleteLocale": {
                return [
                    !!(filter.missingJa && !field.ja),
                    !!(filter.missingEn && !field.en),
                    !!(filter.missingRo && hasRom && !field.ro)
                ].some(v => v)  // false if no set filter is violated, true if any set filter is violated
            }
            case "Search": {
                if (!filter.search) return true
                switch (filter.method) {
                    case "regex":
                        return [
                            !!(field.ja.match(filter.search) ?? false),
                            !!(field.en?.match(filter.search) ?? false),
                            !!(hasRom && (field.ro?.match(filter.search) ?? false))
                        ].some(v => v)  // false if regex matches no fields, true if regex matches any field
                    case "simple":
                    default:
                        return [
                            field.ja.includes(filter.search),
                            !!(field.en?.includes(filter.search)),
                            !!(hasRom && field.ro?.includes(filter.search))
                        ].some(v => v)  // false if no field includes string, true if any field includes string
                }
            }
        }
    }

    private handleSimpleStringFilter(field: string, filter?: SimpleStringFilterOptions): boolean {
        if (!filter) return true
        if (!filter.search) return true
        switch (filter.method) {
            case "regex":
                return !!(field.match(filter.search) ?? false)
            case "simple":
            default:
                return field.includes(filter.search)
        }
    }

    private handleEnumFilter<E>(field: E | E[], filter?: EnumFilterOptions<E>): boolean {
        if (!filter) return true
        const vals: E[] = Array.isArray(field) ? field : [field]
        if (filter.include) {
            for (const v of vals) {
                if (filter.include.includes(v)) return true
            }
            return false
        } else if (filter.exclude) {
            for (const v of vals) {
                if (filter.exclude.includes(v)) return false
            }
            return true
        } else {
            return true
        }
    }

    private handleSort<T extends { createdAt: string }>({ a, b }: { a: T, b: T }, sort?: SortOption<T>[]): number {
        if (!sort) return new Date(a.createdAt) > new Date(a.createdAt) ? 1 : -1
        const compareValue = <K>(v: K[keyof K]): string | number => {
            if (v instanceof Date) return v.getTime()
            if (typeof v === 'object' && v !== null && 'ja' in v) {
                return (v as unknown as LocaleString).ja
            }
            return v as string | number
        }
        for (const s of sort) {
            const av = compareValue(a[s.attribute])
            const bv = compareValue(b[s.attribute])
            if (av < bv) return s.ascending ? -1 : 1
            if (av > bv) return s.ascending ? 1 : -1
        }
        return 0
    }

    // AuditionEffect //
    async getAuditionEffects(p?: PaginateOptions, f?: AuditionEffectFilterOptions, s?: SortOption<IAuditionEffect>[]): Promise<Paginator<AuditionEffect, IAuditionEffect>> {
        const data = (await Promise.all(this.effects
            .filter(e => this.handleDateFilter(e.createdAt, f?.createdAt))
            .filter(e => this.handleDateFilter(e.updatedAt, f?.updatedAt))
            .filter(e => this.handleLocaleStringFilter({ field: e.name, hasRom: false }, f?.name))
            .map(async (m) => (await AuditionEffect.fromDB(m, this.populateMethods)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(AuditionEffect, this.constructPaginator(data, p))
    }

    async getAuditionEffectById(id: string): Promise<Result<AuditionEffect>> {
        const r = this.effects.find(i  => i.id == id)
        return r
            ? success(await AuditionEffect.fromDB(r, this.populateMethods))
            : fail()
    }

    // AuditionTerminology //
    async getAuditionTerminologies(p?: PaginateOptions, f?: AuditionTerminologyFilterOptions, s?: SortOption<IAuditionTerminology>[]): Promise<Paginator<AuditionTerminology, IAuditionTerminology>> {
        const data = (await Promise.all(this.terminologies
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleLocaleStringFilter({ field: i.name, hasRom: false }, f?.name))
            .map(async (i) => (await AuditionTerminology.fromDB(i, this.populateMethods)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(AuditionTerminology, this.constructPaginator(data, p))
    }

    async getAuditionTerminologyById(id: string): Promise<Result<AuditionTerminology>> {
        const r = this.terminologies.find(i  => i.id == id)
        return r
            ? success(await AuditionTerminology.fromDB(r, this.populateMethods))
            : fail()
    }

    // Character //
    async getCharacters(p?: PaginateOptions, f?: CharacterFilterOptions, s?: SortOption<ICharacter>[]): Promise<Paginator<Character, ICharacter>> {
        const combineName = (fn: LocaleString, ln: LocaleString): LocaleString => {
            return {
                ja: `${ln.ja}${fn.ja}`,
                en: fn.en || ln.en ? `${fn.en} ${ln.en} ${fn.en}` : null
            }
        }
        const data = (await Promise.all(this.characters
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleLocaleStringFilter({ field: combineName(i.firstName, i.lastName), hasRom: false }, f?.name))
            .filter(i => f?.isPlayable !== undefined ? i.isPlayable == f.isPlayable : true )
            .map(async (i) => (await Character.fromDB(i)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(Character, this.constructPaginator(data, p))
    }

    async getCharacterById(id: string): Promise<Result<Character>> {
        const r = this.characters.find(i  => i.id == id)
        return r
            ? success(await Character.fromDB(r))
            : fail()
    }

    // PDrink //
    async getPDrinks(p?: PaginateOptions, f?: PDrinkFilterOptions, s?: SortOption<IPDrink>[]): Promise<Paginator<PDrink, IPDrink>> {
        const data = (await Promise.all(this.drinks
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleLocaleStringFilter({ field: i.name, hasRom: true }, f?.name))
            .filter(i => this.handleEnumFilter(i.plan, f?.plan))
            .filter(i => this.handleEnumFilter(i.rarity, f?.rarity))
            .filter(i => this.handleNumberFilter(i.unlockLevel, f?.unlockLevel))
            .map(async (i) => (await PDrink.fromDB(i, this.populateMethods)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(PDrink, this.constructPaginator(data, p))
    }

    async getPDrinkById(id: string): Promise<Result<PDrink>> {
        const r = this.drinks.find(i  => i.id == id)
        return r
            ? success(await PDrink.fromDB(r, this.populateMethods))
            : fail()
    }

    // PIdol //
    async getPIdols(p?: PaginateOptions, f?: PIdolFilterOptions, s?: SortOption<IPIdol>[]): Promise<Paginator<PIdol, IPIdol>> {
        const data = (await Promise.all(this.idols
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleLocaleStringFilter({ field: i.name, hasRom: false }, f?.name))
            .filter(i => this.handleEnumFilter(i.character, f?.character))
            .filter(i => this.handleEnumFilter(i.rarity, f?.rarity))
            .filter(i => this.handleEnumFilter(i.plan, f?.plan))
            .filter(i => f?.isWelfare !== undefined ? i.isWelfare == f.isWelfare : true)
            .filter(i => f?.hasPrimaStellaUpgrade !== undefined ? (i.primaStellaUpgrade !== null) == f.hasPrimaStellaUpgrade : true)
            .filter(i => f?.hasTrainingLv7 !== undefined ? (i.trainingLevels.length === 7) == f.hasTrainingLv7 : true)
            .map(async (i) => (await PIdol.fromDB(i, this.populateMethods)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(PIdol, this.constructPaginator(data, p))
    }

    async getPIdolById(id: string): Promise<Result<PIdol>> {
        const r = this.idols.find(i  => i.id == id)
        return r
            ? success(await PIdol.fromDB(r, this.populateMethods))
            : fail()
    }

    // PItem //
    async getPItems(p?: PaginateOptions, f?: PItemFilterOptions, s?: SortOption<IPItem>[]): Promise<Paginator<PItem, IPItem>> {
        const data = (await Promise.all(this.items
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleLocaleStringFilter({ field: i.name, hasRom: false }, f?.name))
            .filter(i => this.handleEnumFilter(i.plan, f?.plan))
            .filter(i => this.handleEnumFilter(i.rarity, f?.rarity))
            .filter(i => this.handleEnumFilter(i.source, f?.source))
            .filter(i => this.handleNumberFilter(i.unlockLevel, f?.unlockLevel))
            .map(async (i) => (await PItem.fromDB(i, this.populateMethods)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(PItem, this.constructPaginator(data, p))
    }

    async getPItemById(id: string): Promise<Result<PItem>> {
        const r = this.items.find(i  => i.id == id)
        return r
            ? success(await PItem.fromDB(r, this.populateMethods))
            : fail()
    }

    // Skill //
    async getSkills(p?: PaginateOptions, f?: SkillFilterOptions, s?: SortOption<ISkill>[]): Promise<Paginator<Skill, ISkill>> {
        const data = (await Promise.all(this.skills
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleLocaleStringFilter({ field: i.name, hasRom: false }, f?.name))
            .filter(i => this.handleEnumFilter(i.plan, f?.plan))
            .filter(i => this.handleEnumFilter(i.rarity, f?.rarity))
            .filter(i => this.handleEnumFilter(i.category, f?.category))
            .filter(i => this.handleEnumFilter(i.source, f?.source))
            .filter(i => this.handleNumberFilter(i.unlockLevel, f?.unlockLevel))
            .filter(i => f?.isCustomizable !== undefined ? (i.customizeOptions.length != 0) == f.isCustomizable : true)
            .map(async (i) => (await Skill.fromDB(i, this.populateMethods)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(Skill, this.constructPaginator(data, p))
    }

    async getSkillById(id: string): Promise<Result<Skill>> {
        const r = this.skills.find(i  => i.id == id)
        return r
            ? success(await Skill.fromDB(r, this.populateMethods))
            : fail()
    }

    // SupportCard //
    async getSupportCards(p?: PaginateOptions, f?: SupportCardFilterOptions, s?: SortOption<ISupportCard>[]): Promise<Paginator<SupportCard, ISupportCard>> {
        throw new InternalServerError("Method not implemented.")
    }

    async getSupportCardById(id: string): Promise<Result<SupportCard>> {
        throw new InternalServerError("Not implemented.")
    }

    // User //
    async getUsers(p?: PaginateOptions, f?: UserFilterOptions, s?: SortOption<IUser>[]): Promise<Paginator<User, IUser>> {
        const data = (await Promise.all(this.users
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleSimpleStringFilter(i.displayName, f?.displayName))
            .filter(i => this.handleEnumFilter(i.roles, f?.roles))
            .map(async (i) => (await User.fromDB(i)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(User, this.constructPaginator(data, p))
    }

    async getUserById(id: string): Promise<Result<User>> {
        const r = this.users.find(i => i.id === id)
        return r
            ? success(await User.fromDB(r))
            : fail()
    }

    async getUserByIdentity(provider: AuthProvider, subject: string): Promise<Result<User>> {
        const r = this.users.find(i =>
            i.identities.some(id => id.subject === subject && id.provider === provider)
        )
        return r
            ? success(await User.fromDB(r))
            : fail()
    }

    async getUserByEmail(email: string): Promise<Result<User>> {
        const r = this.users.find(i => i.email === email)
        return r
            ? success(await User.fromDB(r))
            : fail()
    }

    async createUser(obj: New<IUser>): Promise<Result<User>> {
        const created = new User({
            ...obj,
            ...this.getNewObj()
        })
        this.users.push(created.toDB())
        return success(created)
    }

    async updateUser(id: string, obj: Partial<New<IUser>>): Promise<Result<User>> {
        let toUpdate = this.users.find(i => i.id === id)
        if (!toUpdate) return fail()
        const updated = new User({
            ...((await User.fromDB(toUpdate)).toJSON()),
            ...obj,
            updatedAt: new Date().toISOString()
        })
        const toUpdateIndex = this.users.findIndex(i => i.id === id)
        if (toUpdateIndex === -1) return fail()
        this.users[toUpdateIndex] = updated.toDB()
        return success(updated)
    }

    async deleteUser(id: string): Promise<Result<null>> {
        const toDelete = this.users.findIndex(i => i.id === id)
        if (toDelete === -1) return fail()
        this.users.splice(toDelete, 1)
        return success(null)
    }

    // Session //
    async getSessions(p?: PaginateOptions, f?: SessionFilterOptions, s?: SortOption<ISession>[]): Promise<Paginator<Session, ISession>> {
        const data = (await Promise.all(this.sessions
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleDateFilter(i.lastSeenAt, f?.lastSeenAt))
            .filter(i => this.handleSimpleStringFilter(i.userAgent ?? "", f?.userAgent))
            .filter(i => this.handleEnumFilter(i.user, f?.user))
            .map(async (i) => (await Session.fromDB(i, this.populateMethods.user)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(Session, this.constructPaginator(data, p))
    }

    async getUserSessions(userId: string, p?: PaginateOptions, f?: SessionFilterOptions, s?: SortOption<ISession>[]): Promise<Paginator<Session, ISession>> {
        const data = (await Promise.all(this.sessions
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleDateFilter(i.lastSeenAt, f?.lastSeenAt))
            .filter(i => this.handleSimpleStringFilter(i.userAgent ?? "", f?.userAgent))
            .filter(i => i.user === userId && i.expiresAt > new Date())
            .map(async (i) => (await Session.fromDB(i, this.populateMethods.user)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(Session, this.constructPaginator(data, p))
    }

    async getSessionById(id: string): Promise<Result<Session>> {
        const r = this.sessions.find(i => i.id === id)
        return r
            ? success(await Session.fromDB(r, this.populateMethods.user))
            : fail()
    }

    async getSessionByToken(token: string): Promise<Result<Session>> {
        const r = this.sessions.find(i => i.tokenHash === HASH_FUNCTION(token) && i.expiresAt > new Date())
        if (!r) return fail()
        r.lastSeenAt = new Date().toISOString()
        r.expiresAt = new Date(Date.now() + SESSION_REFRESH_TIME)
        return success(await Session.fromDB(r, this.populateMethods.user))
    }

    async createSession(obj: New<ISession>, token: string, ip?: string): Promise<Result<Session>> {
        const created = new Session({
            ...obj,
            ...this.getNewObj()
        })
        this.sessions.push(created.toDBInsert(HASH_FUNCTION(token), ip ?? null))
        return success(created)
    }

    async deleteUserSessions(userId: string): Promise<Result<null>> {
        this.sessions.splice(0, this.sessions.length, ...this.sessions.filter(i => i.user !== userId))
        return success(null)
    }

    async deleteSession(id: string): Promise<Result<null>> {
        const toDelete = this.sessions.findIndex(i => i.id === id)
        if (toDelete === -1) return fail()
        this.sessions.splice(toDelete, 1)
        return success(null)
    }
}
