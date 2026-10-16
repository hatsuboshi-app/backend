import { fail, Result, success } from "@hatsuboshi/types"
import IRepositoryService from "@/services/repository/repository.service"
import { createHash, randomBytes, timingSafeEqual } from "node:crypto"
import { APIKey, AuthScopePattern, ICreatedAPIKey, User } from "@hatsuboshi/types/auth"
import config from "@/lib/config";

export type APIKeyResult<T> = Result<T, APIKeyEC>

export type APIKeyEC = `auth/${
    | "credential-invalid"
    | "credential-expired"
    | "credential-malformed"
    | "service-unavailable"
}`  | "db/not-found"

export default class APIKeyService {
    private readonly db: IRepositoryService

    constructor(db: IRepositoryService) {
        this.db = db
    }

    private randomHex(length: number): string {
        return randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length)
    }

    private hash(secret: string): string {
        return createHash("sha256").update(secret).digest("hex")
    }

    private matches(secret: string, hash: string): boolean {
        const a = Buffer.from(this.hash(secret), "hex")
        const b = Buffer.from(hash, "hex")
        return a.length === b.length && timingSafeEqual(a, b)
    }

    touch(key: APIKey): void {
        const last = key.lastUsedAt ? Date.parse(key.lastUsedAt) : 0
        const now = new Date()
        if (now.getTime() - last < config.defaults.apiKey.lastUsedThrottleMs)
            return
        this.db.recordAPIKeyUse(key.id, now).catch(() => {})
    }

    async create(user: User, label: string, scopes: AuthScopePattern[], expiresAt?: string | null): Promise<APIKeyResult<ICreatedAPIKey>> {
        const secret = this.randomHex(config.defaults.apiKey.secretLength)
        const secretHash = this.hash(secret)
        for (let attempt = 0; attempt < 5; attempt++) {
            const prefix = this.randomHex(config.defaults.apiKey.prefixLength)
            const r = await this.db.createAPIKey({
                userId:     user.id,
                label,
                prefix,
                suffix:     secret.slice(-config.defaults.apiKey.suffixLength),
                scopes,
                expiresAt:  expiresAt ? new Date(expiresAt).toISOString() : null,
                lastUsedAt: null,
                revokedAt:  null,
                secretHash
            })
            if (r.success) {
                const key = `${config.defaults.apiKey.tag}_${prefix}_${secret}`
                return success(r.data.toCreatedAPIKey(key))
            }
            if (r.error !== "db/already-exists") {
                break
            }
        }
        return fail("auth/service-unavailable")
    }

    async verify(raw: string): Promise<APIKeyResult<APIKey>> {
        const parts = raw.split("_")
        if (parts.length !== 3 || parts[0] !== config.defaults.apiKey.tag || !parts[1] || !parts[2])
            return fail("auth/credential-malformed")
        const [_, prefix, secret] = parts

        const r = await this.db.getAPIKeyByPrefix(prefix)
        if (!r.success || !this.matches(secret, r.data.secretHash))
            return fail("auth/credential-invalid")
        const key = r.data.key
        if (key.revokedAt)
            return fail("auth/credential-invalid")
        if (key.expiresAt && new Date(key.expiresAt) < new Date())
            return fail("auth/credential-expired")

        return success(key)
    }

    async revoke(id: string): Promise<APIKeyResult<APIKey>> {
        const r = await this.db.getAPIKeyById(id)
        if (!r.success)
            return fail("db/not-found")
        if (r.data.revokedAt)
            return success(r.data)
        const u = await this.db.updateAPIKey(id, { revokedAt: new Date().toISOString() })
        return u.success ? success(u.data) : fail("db/not-found")
    }
}