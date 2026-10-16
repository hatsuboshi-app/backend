import IIdPService, { Identity, IdPCredentialKind, IdPResult } from "@/services/auth/idp/idp.service"
import { AuthProvider } from "@hatsuboshi/types/auth"
import { fail, success } from "@hatsuboshi/types"
import config from "@/config";
import { randomBytes } from "node:crypto"

type IdPUser = {
    uid: string
    email: string
    verified: boolean
    disabled: boolean
    tokensValidAfter: Date | null
}

type IdPToken = {
    id: string
    subject: string
    authTime: Date | null
    expiresAt: Date | null
}

type IdPSession = IdPToken

export class LocalIdPService implements IIdPService {
    readonly provider: AuthProvider

    private readonly users: IdPUser[]
    private readonly tokens: IdPToken[]
    private readonly sessions: IdPSession[]

    constructor() {
        const subjects = ["admin", "maintainer", "translator", "user"]
        this.provider = "local"
        this.users = subjects.map(r => {
            return {
                uid: r,
                email: `${r}@hatsuboshi.app`,
                verified: true,
                disabled: false,
                tokensValidAfter: null
            }
        })
        this.tokens = subjects.map(r => {
            return {
                id: r,
                subject: r,
                authTime: null,
                expiresAt: null
            }
        })
        this.sessions = []
    }

    async verifyIdToken(token: string, checkRevoked?: boolean): Promise<IdPResult<Identity>> {
        const tf = this.tokens.find(t => t.id === token)
        if (!tf)
            return fail("auth/credential-invalid")

        if (tf.expiresAt && tf.expiresAt < new Date())
            return fail("auth/credential-expired")

        const uf = this.users.find(u => u.uid === tf.subject)
        if (!uf || checkRevoked && (uf.disabled ||  uf.tokensValidAfter && (tf.authTime || new Date()) < uf.tokensValidAfter))
            return fail("auth/credential-invalid")

        return success({
            provider: this.provider,
            subject: tf.subject,
            email: uf.email,
            isVerified: uf.verified,
            authTime: tf.authTime || new Date()
        })
    }

    async verifySession(session: string, checkRevoked?: boolean): Promise<IdPResult<Identity>> {
        const sf = this.sessions.find(s => s.id === session)
        if (!sf)
            return fail("auth/credential-invalid")

        if (sf.expiresAt && sf.expiresAt < new Date())
            return fail("auth/credential-expired")

        const uf = this.users.find(u => u.uid === sf.subject)
        if (!uf || checkRevoked && (uf.disabled ||  uf.tokensValidAfter && (sf.authTime || new Date()) < uf.tokensValidAfter))
            return fail("auth/credential-invalid")

        return success({
            provider: this.provider,
            subject: sf.subject,
            email: uf.email,
            isVerified: uf.verified,
            authTime: sf.authTime || new Date()
        })
    }

    async createSession(token: string): Promise<IdPResult<{ session: string, expiresAt: string }>> {
        // verify with revocation check first
        const t = await this.verifyIdToken(token, true)
        if (!t.success)
            return t
        // check auth time
        if (Date.now() - t.data.authTime.getTime() > config.defaults.idp.sessionMaxSignInAgeMs)
            return fail("auth/credential-stale")
        // mint the cookie
        const cookie = randomBytes(32).toString("base64url")
        const expiresAt = new Date(Date.now() + config.defaults.idp.sessionDurationMs)
        this.sessions.push({
            id: cookie,
            subject: t.data.subject,
            authTime: t.data.authTime,
            expiresAt: expiresAt,
        })
        return success({ session: cookie, expiresAt: expiresAt.toISOString() })
    }

    async revokeAllSessions(subject: string): Promise<IdPResult<null>> {
        const uf = this.users.find(u => u.uid === subject)
        if (uf) {
            uf.tokensValidAfter = new Date()
        }
        return success(null)
    }

    classify(credential: string): IdPCredentialKind | null {
        if (this.tokens.some(t => t.id === credential))
            return "id-token"
        if (this.sessions.some(s => s.id === credential))
            return "session"
        return null
    }
}
