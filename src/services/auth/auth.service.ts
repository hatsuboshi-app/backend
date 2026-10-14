import { fail, Result, success } from "@hatsuboshi/types"
import { APIKey, AuthScope, User } from "@hatsuboshi/types/auth"
import IIdPService, { Identity, IdPCredentialKind, IdPError } from "@/services/auth/idp/idp.service"
import APIKeyService, { APIKeyError } from "@/services/auth/api-key/api-key.service"
import IRepositoryService from "@/services/repository/repository.service"
import config from "@/config"
import { expandScopes, grantedPatterns } from "@/services/auth/scopes"

export type AuthContext =
| {
    kind: "session" | "id-token"
    user: User
    scopes: readonly AuthScope[]
    authTime: Date
    apiKeyId?: never
  }
| {
    kind: "api-key"
    user: User
    scopes: readonly AuthScope[]
    authTime?: never
    apiKeyId: string
  }

export type AuthResult<T> = Result<T, AuthError>

export type AuthError = `auth/${
    | "credential-missing"
    | "credential-malformed"
    | "user-not-registered"
    | "user-disabled"
    | "email-unverified"
}`  | IdPError
    | APIKeyError

export class AuthService {
    private readonly db: IRepositoryService
    private readonly idp: IIdPService
    private readonly apiKey: APIKeyService

    constructor(db: IRepositoryService, idp: IIdPService, apiKey: APIKeyService) {
        this.db = db
        this.idp = idp
        this.apiKey = apiKey
    }

    async createSession(token: string): Promise<AuthResult<string>> {
        const ctx = await this.authenticateIdentity("id-token", token)
        if (!ctx.success)
            return ctx
        const session = await this.idp.createSession(token)
        if (!session.success)
            return session
        return success(session.data)
    }

    async authenticate(claim?: string): Promise<AuthResult<AuthContext>> {
        if (!claim)
            return fail("auth/credential-missing")

        const [scheme, credential, ...rest] = claim.trim().split(/\s+/)
        if (scheme.toLowerCase() !== "bearer" || !credential || rest.length > 0)
            return fail("auth/credential-malformed")

        if (credential.startsWith(`${config.defaults.apiKey.tag}_`))
            return this.authenticateAPIKey(credential)

        switch (this.idp.classify(credential)) {
            case "session":     return this.authenticateIdentity("session", credential)
            case "id-token":    return this.authenticateIdentity("id-token", credential)
            default:            return fail("auth/credential-malformed")
        }
    }

    private async authenticateAPIKey(credential: string): Promise<AuthResult<AuthContext>> {
        const r = await this.apiKey.verify(credential)
        if (!r.success)
            return r
        const u = await this.db.getUserById(r.data.userId)
        if (!u.success)
            return fail("auth/credential-invalid")
        if (u.data.disabledAt)
            return fail("auth/user-disabled")
        this.apiKey.touch(r.data)
        return success({
            kind: "api-key",
            user: u.data,
            scopes: this.effectiveScopes(u.data, r.data),
            apiKeyId: r.data.id
        })
    }

    private async authenticateIdentity(kind: IdPCredentialKind, credential: string): Promise<AuthResult<AuthContext>> {
        const id = kind === "session"
            ? await this.idp.verifySession(credential, true)
            : await this.idp.verifyIdToken(credential, true)
        if (!id.success)
            return id

        if (!id.data.isVerified)
            return fail("auth/email-unverified")

        let user: AuthResult<User>
        if (kind === "id-token") {
            // attempt upserting user if auth is with id-token
            user = await this.upsertUser(id.data)
        } else {
            // don't attempt upserting user if auth is with session as upsert is attempted upon session mint
            const r = await this.db.getUserByIdentity(id.data.provider, id.data.subject)
            user = r.success ? r : fail("auth/user-not-registered")
        }
        if (!user.success)
            return user
        if (user.data.disabledAt)
            return fail("auth/user-disabled")

        return success({
            kind,
            user: user.data,
            scopes: this.effectiveScopes(user.data),
            authTime: id.data.authTime
        })
    }

    private async upsertUser(identity: Identity): Promise<AuthResult<User>> {
        const found = await this.db.getUserByIdentity(identity.provider, identity.subject)

        // existing user, sync user data with idp
        if (found.success) {
            const u = found.data
            const email = identity.email ?? u.email
            if (u.email === email && u.verified === identity.isVerified)
                return success(u)
            const updated = await this.db.updateUser(u.id, {
                email,
                verified: identity.isVerified
            })
            return updated.success ? updated : fail("auth/service-unavailable")
        }

        // first time user, create user from idp
        const created = await this.db.createUser({
            displayName: "New Producer",
            displayIcon: null,
            description: null,
            roles: ["user"],
            extraScopes: [],
            disabledAt: null,
            email: identity.email,
            verified: identity.isVerified,
            identities: [{ provider: identity.provider, subject: identity.subject }],
        })
        if (created.success)
            return created

        // lost a race condition with a concurrent first time request, fetch the created document
        if (created.error === "db/already-exists") {
            const retry = await this.db.getUserByIdentity(identity.provider, identity.subject)
            if (retry.success)
                return retry
        }

        return fail("auth/service-unavailable")
    }

    private effectiveScopes(user: User, key?: APIKey): readonly AuthScope[] {
        const granted = expandScopes(grantedPatterns(user))
        if (!key) return granted
        const allowed = expandScopes(key.scopes)
        return granted.filter(s => allowed.includes(s))
    }
}