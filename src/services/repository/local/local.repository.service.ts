import path from "node:path"
import { readFileSync } from "jsonfile"
import IRepositoryService, {
    APIKeyCredential, APIKeyPatch,
    PaginateOptions,
    ReferencePopulateMethods, RepositoryResult, UserPatch
} from "@/services/repository/repository.service"
import {
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
    IAuditionEffect,
    IAuditionTerminology,
    ICharacter,
    IPDrink,
    IPIdol,
    IPItem,
    ISkill,
    ISupportCard,
    Paginator,
    DBSupportCard, LocaleString, LocaleStringWithRomaji, LocaleStringFilterOptions,
    DateFilterOptions, SortOption, IPaginator, EnumFilterOptions, NumberFilterOptions, New, SimpleStringFilterOptions,
    IPersistentObject, ListRequest, AuditionEffectFilter, AuditionTerminologyFilter, CharacterFilter, PDrinkFilter,
    PIdolFilter, PItemFilter, SkillFilter, SupportCardFilter
} from "@hatsuboshi/types"
import config from "@/lib/config"
import {
    APIKey, APIKeyFilter,
    AuthProvider, DBAPIKey,
    DBUser, IAPIKey,
    IUser,
    User, UserFilter
} from "@hatsuboshi/types/auth"
import ControllerError from "@/lib/errors"

type LocaleStringFieldOptions = { field: LocaleStringWithRomaji, hasRom: true } | { field: LocaleString, hasRom: false }

export default class LocalRepositoryService implements IRepositoryService {
    private effects: DBAuditionEffect[]
    private terminologies: DBAuditionTerminology[]
    private characters: DBCharacter[]
    private drinks: DBPDrink[]
    private idols: DBPIdol[]
    private items: DBPItem[]
    private skills: DBSkill[]
    private supportCards: DBSupportCard[]

    private users: DBUser[]
    private apiKeys: DBAPIKey[]

    private populateMethods: ReferencePopulateMethods = {
        auditionEffect: async (id: string): Promise<DBAuditionEffect> => {
            const data = this.effects.find(x => x.id === id)
            if (!data) throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "auditionEffect", id }
            )
            return data
        },
        auditionTerminology: async (id: string): Promise<DBAuditionTerminology> => {
            const data = this.terminologies.find(x => x.id === id)
            if (!data) throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "auditionTerminology", id }
            )
            return data
        },
        character: async (id: string): Promise<DBCharacter> => {
            const data = this.characters.find(x => x.id === id)
            if (!data) throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "character", id }
            )
            return data
        },
        skill: async (id: string): Promise<DBSkill> => {
            const data = this.skills.find(x => x.id === id)
            if (!data) throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "skill", id }
            )
            return data
        },
        pItem: async (id: string): Promise<DBPItem> => {
            const data = this.items.find(x => x.id === id)
            if (!data) throw new ControllerError(
                "db/bad-reference",
                "One or more references failed to resolve",
                { resource: "pItem", id }
            )
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
        this.apiKeys = readFileSync(path.join(dir, "APIKey.json"))
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

    private handleDateFilter(field: string | null, filter?: DateFilterOptions): boolean {
        if (!filter) return true
        if (!field) return false
        const d = new Date(field)
        if (filter.before && d > new Date(filter.before)) return false
        if (filter.after && d < new Date(filter.after)) return false
        //
        return true
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
                return [
                    field.ja.toLowerCase().includes(filter.search.trim().toLowerCase()),
                    !!(field.en?.toLowerCase().includes(filter.search.trim().toLowerCase())),
                    !!(hasRom && field.ro?.toLowerCase().includes(filter.search.trim().toLowerCase()))
                ].some(v => v)  // false if no field includes string, true if any field includes string
            }
        }
    }

    private handleSimpleStringFilter(field: string, filter?: SimpleStringFilterOptions): boolean {
        if (!filter) return true
        if (!filter.search) return true
        return field.toLowerCase().includes(filter.search.trim().toLowerCase())
    }

    private handleEnumFilter<E>(field: E | E[], filter?: EnumFilterOptions<E>): boolean {
        if (!filter) return true
        const vals: E[] = Array.isArray(field) ? field : [field]
        const { include, exclude } = filter
        if (include && !vals.some(v => include.includes(v))) return false
        if (exclude && vals.some(v => exclude.includes(v))) return false
        //
        return true
    }

    private handleSort<T extends { createdAt: string, id: string }>({ a, b }: { a: T, b: T }, sort?: SortOption<T>[]): number {
        const compareValue = <K>(v: K[keyof K]): string | number | null => {
            if (v instanceof Date) return v.getTime()
            if (typeof v === 'object' && v !== null && 'ja' in v) {
                return (v as unknown as LocaleString).ja
            }
            return (v ?? null) as string | number | null
        }
        const order = sort?.length ? sort : [{ attribute: "createdAt", ascending: true } as SortOption<T>]
        for (const s of order) {
            const av = compareValue(a[s.attribute])
            const bv = compareValue(b[s.attribute])
            if (av === bv) continue
            if (av === null) return s.ascending ? -1 : 1
            if (bv === null) return s.ascending ? 1 : -1
            if (av < bv) return s.ascending ? -1 : 1
            if (av > bv) return s.ascending ? 1 : -1
        }
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    }

    // AuditionEffect //
    async listAuditionEffects({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<AuditionEffectFilter, IAuditionEffect>): Promise<Paginator<AuditionEffect, IAuditionEffect>> {
        const data = (await Promise.all(this.effects
            .filter(e => this.handleDateFilter(e.createdAt, f?.createdAt))
            .filter(e => this.handleDateFilter(e.updatedAt, f?.updatedAt))
            .filter(e => this.handleLocaleStringFilter({ field: e.name, hasRom: false }, f?.name))
            .map(async (m) => (await AuditionEffect.fromDB(m, this.populateMethods)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(AuditionEffect, this.constructPaginator(data, { page: p, perPage: pp }))
    }

    async getAuditionEffectById(id: string): Promise<RepositoryResult<AuditionEffect>> {
        const r = this.effects.find(i  => i.id == id)
        return r
            ? success(await AuditionEffect.fromDB(r, this.populateMethods))
            : fail("db/not-found")
    }

    // AuditionTerminology //
    async listAuditionTerminologies({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<AuditionTerminologyFilter, IAuditionTerminology>): Promise<Paginator<AuditionTerminology, IAuditionTerminology>> {
        const data = (await Promise.all(this.terminologies
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleLocaleStringFilter({ field: i.name, hasRom: false }, f?.name))
            .map(async (i) => (await AuditionTerminology.fromDB(i, this.populateMethods)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(AuditionTerminology, this.constructPaginator(data, { page: p, perPage: pp }))
    }

    async getAuditionTerminologyById(id: string): Promise<RepositoryResult<AuditionTerminology>> {
        const r = this.terminologies.find(i  => i.id == id)
        return r
            ? success(await AuditionTerminology.fromDB(r, this.populateMethods))
            : fail("db/not-found")
    }

    // Character //
    async listCharacters({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<CharacterFilter, ICharacter>): Promise<Paginator<Character, ICharacter>> {
        const combineName = (fn: LocaleString, ln: LocaleString): LocaleString => {
            return {
                ja: `${ln.ja}${fn.ja}`,
                en: fn.en || ln.en ? `${fn.en ?? ""} ${ln.en ?? ""} ${fn.en ?? ""}` : null
            }
        }
        const data = (await Promise.all(this.characters
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => {
                if (f?.name?.type !== "IncompleteLocale")
                    return this.handleLocaleStringFilter({ field: combineName(i.firstName, i.lastName), hasRom: false }, f?.name)
                return [
                    !!(f.name.missingJa && !combineName(i.firstName, i.lastName).ja),
                    !!(f.name.missingEn && [i.firstName, i.lastName].some(n => n.ja && !n.en))
                ].some(v => v)
            })
            .filter(i => f?.isPlayable !== undefined ? i.isPlayable == f.isPlayable : true )
            .map(async (i) => (await Character.fromDB(i)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(Character, this.constructPaginator(data, { page: p, perPage: pp }))
    }

    async getCharacterById(id: string): Promise<RepositoryResult<Character>> {
        const r = this.characters.find(i  => i.id == id)
        return r
            ? success(await Character.fromDB(r))
            : fail("db/not-found")
    }

    // PDrink //
    async listPDrinks({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<PDrinkFilter, IPDrink>): Promise<Paginator<PDrink, IPDrink>> {
        const data = (await Promise.all(this.drinks
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleLocaleStringFilter({ field: i.name, hasRom: true }, f?.name))
            .filter(i => this.handleEnumFilter(i.plan, f?.plan))
            .filter(i => this.handleEnumFilter(i.rarity, f?.rarity))
            .filter(i => this.handleNumberFilter(i.unlockLevel, f?.unlockLevel))
            .map(async (i) => (await PDrink.fromDB(i, this.populateMethods)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(PDrink, this.constructPaginator(data, { page: p, perPage: pp }))
    }

    async getPDrinkById(id: string): Promise<RepositoryResult<PDrink>> {
        const r = this.drinks.find(i  => i.id == id)
        return r
            ? success(await PDrink.fromDB(r, this.populateMethods))
            : fail("db/not-found")
    }

    // PIdol //
    async listPIdols({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<PIdolFilter, IPIdol>): Promise<Paginator<PIdol, IPIdol>> {
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
        return new Paginator(PIdol, this.constructPaginator(data, { page: p, perPage: pp }))
    }

    async getPIdolById(id: string): Promise<RepositoryResult<PIdol>> {
        const r = this.idols.find(i  => i.id == id)
        return r
            ? success(await PIdol.fromDB(r, this.populateMethods))
            : fail("db/not-found")
    }

    // PItem //
    async listPItems({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<PItemFilter, IPItem>): Promise<Paginator<PItem, IPItem>> {
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
        return new Paginator(PItem, this.constructPaginator(data, { page: p, perPage: pp }))
    }

    async getPItemById(id: string): Promise<RepositoryResult<PItem>> {
        const r = this.items.find(i  => i.id == id)
        return r
            ? success(await PItem.fromDB(r, this.populateMethods))
            : fail("db/not-found")
    }

    // Skill //
    async listSkills({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<SkillFilter, ISkill>): Promise<Paginator<Skill, ISkill>> {
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
        return new Paginator(Skill, this.constructPaginator(data, { page: p, perPage: pp }))
    }

    async getSkillById(id: string): Promise<RepositoryResult<Skill>> {
        const r = this.skills.find(i  => i.id == id)
        return r
            ? success(await Skill.fromDB(r, this.populateMethods))
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
        const data = (await Promise.all(this.users
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleSimpleStringFilter(i.displayName, f?.displayName))
            .filter(i => this.handleEnumFilter(i.roles, f?.roles))
            .map(async (i) => (await User.fromDB(i)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(User, this.constructPaginator(data, { page: p, perPage: pp }))
    }

    async getUserById(id: string): Promise<RepositoryResult<User>> {
        const r = this.users.find(i => i.id === id)
        return r ? success(await User.fromDB(r)) : fail("db/not-found")
    }

    async getUserByIdentity(provider: AuthProvider, subject: string): Promise<RepositoryResult<User>> {
        const r = this.users.find(i => i.identities.some(id => id.subject === subject && id.provider === provider))
        return r ? success(await User.fromDB(r)) : fail("db/not-found")
    }

    async getUserByEmail(email: string): Promise<RepositoryResult<User>> {
        const r = this.users.find(i => i.email === email)
        return r ? success(await User.fromDB(r)) : fail("db/not-found")
    }

    async createUser(obj: New<DBUser>): Promise<RepositoryResult<User>> {
        for (const i of obj.identities)
            if ((await this.getUserByIdentity(i.provider, i.subject)).success)
                return fail("db/already-exists")
        const created = new User({
            ...await User.fromDB({
                ...obj,
                ...this.getNewObj()
            })
        })
        this.users.push(created.toDB())
        return success(created)
    }

    async updateUser(id: string, patch: UserPatch): Promise<RepositoryResult<User>> {
        const index = this.users.findIndex(i => i.id === id)
        if (index === -1) return fail("db/not-found")
        const updated = new User({
            ...(await User.fromDB({
                ...this.users[index],
                ...patch
            })).toJSON(),
            updatedAt: new Date().toISOString()
        })
        this.users[index] = updated.toDB()
        return success(updated)
    }

    async deleteUser(id: string): Promise<RepositoryResult<null>> {
        this.users = this.users.filter(u => u.id !== id)
        this.apiKeys = this.apiKeys.filter(k => k.userId !== id)
        return success(null)
    }

    // APIKey //
    async listAPIKeys({ filter: f, sort: s, page: p, perPage: pp }: ListRequest<APIKeyFilter, IAPIKey>): Promise<Paginator<APIKey, IAPIKey>> {
        const now = new Date()
        const data = (await Promise.all(this.apiKeys
            .filter(i => this.handleDateFilter(i.createdAt, f?.createdAt))
            .filter(i => this.handleDateFilter(i.updatedAt, f?.updatedAt))
            .filter(i => this.handleSimpleStringFilter(i.label, f?.label))
            .filter(i => this.handleEnumFilter(i.userId, f?.userId))
            .filter(i => this.handleDateFilter(i.lastUsedAt, f?.lastUsedAt))
            .filter(i => {
                if (f?.isExpired === undefined) return true
                const isExpired = i.expiresAt !== null && new Date(i.expiresAt) < now
                return isExpired === f.isExpired
            })
            .filter(i => {
                if (f?.isRevoked === undefined) return true
                return (i.revokedAt !== null) === f.isRevoked
            })
            .map(async (i) => (await APIKey.fromDB(i)).toJSON())
        )).sort((a, b) => this.handleSort({ a, b }, s))
        return new Paginator(APIKey, this.constructPaginator(data, { page: p, perPage: pp }))
    }

    async getAPIKeyById(id: string): Promise<RepositoryResult<APIKey>> {
        const r = this.apiKeys.find(i => i.id === id)
        return r ? success(await APIKey.fromDB(r)) : fail("db/not-found")
    }

    async getAPIKeyByPrefix(prefix: string): Promise<RepositoryResult<APIKeyCredential>> {
        const r = this.apiKeys.find(i => i.prefix === prefix)
        return r ? success({ key: await APIKey.fromDB(r), secretHash: r.secretHash }) : fail("db/not-found")
    }

    async createAPIKey(obj: New<DBAPIKey>): Promise<RepositoryResult<APIKey>> {
        if ((await this.getAPIKeyByPrefix(obj.prefix)).success)
            return fail("db/already-exists")
        const created = new APIKey({
            ...(await APIKey.fromDB({
                ...obj,
                ...this.getNewObj()
            }))
        })
        this.apiKeys.push({ ...created.toDB(), secretHash: obj.secretHash })
        return success(created)
    }

    async recordAPIKeyUse(id: string, at?: Date): Promise<RepositoryResult<APIKey>> {
        const index = this.apiKeys.findIndex(i => i.id === id)
        if (index === -1) return fail("db/not-found")
        const updated = new APIKey({
            ...(await APIKey.fromDB({
                ...this.apiKeys[index],
                lastUsedAt: at?.toISOString() ?? new Date().toISOString()
            })).toJSON()
        })
        const secretHash = this.apiKeys[index].secretHash
        this.apiKeys[index] = { ...updated.toDB(), secretHash  }
        return success(updated)
    }

    async updateAPIKey(id: string, patch: APIKeyPatch): Promise<RepositoryResult<APIKey>> {
        const index = this.apiKeys.findIndex(i => i.id === id)
        if (index === -1) return fail("db/not-found")
        const updated = new APIKey({
            ...(await APIKey.fromDB({
                ...this.apiKeys[index],
                ...patch
            })).toJSON(),
            updatedAt: new Date().toISOString()
        })
        const secretHash = this.apiKeys[index].secretHash
        this.apiKeys[index] = { ...updated.toDB(), secretHash  }
        return success(updated)
    }

    async deleteAPIKey(id: string): Promise<RepositoryResult<null>> {
        this.apiKeys = this.apiKeys.filter(k => k.id !== id)
        return success(null)
    }
}
