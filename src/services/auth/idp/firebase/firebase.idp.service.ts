import { cert, type FirebaseError, initializeApp } from "firebase-admin/app"
import { type Auth, getAuth } from "firebase-admin/auth"
import IIdPService, { Identity, IdPCredentialKind, IdPError, IdPResult } from "@/services/auth/idp/idp.service"
import { AuthProvider } from "@hatsuboshi/types/auth"
import { fail, success } from "@hatsuboshi/types"
import config from "@/config"

export type FirebaseCredentials = {
    projectId: string
    clientEmail: string
    privateKey: string
}

export class FirebaseIdPService implements IIdPService {
    readonly provider: AuthProvider

    private readonly projectId: string
    private readonly app: Auth

    constructor({ projectId, clientEmail, privateKey }: FirebaseCredentials) {
        this.provider = "firebase"
        this.projectId = projectId
        this.app = getAuth(initializeApp({
            credential: cert({
                projectId, clientEmail, privateKey
            })
        }))
    }

    private isFirebaseError(e: unknown): e is FirebaseError {
        return typeof e === "object" && e !== null && typeof (e as { code?: unknown }).code === "string"
    }

    private toError(e: unknown): IdPError {
        if (!this.isFirebaseError(e))
            return "auth/service-unavailable"

        if (e.code === "auth/id-token-expired" || e.code === "auth/session-cookie-expired")
            return "auth/credential-expired"

        if (e.code === "auth/argument-error" && e.message.includes("public keys"))
            return "auth/service-unavailable"

        if (new Set([
            "auth/argument-error",
            "auth/invalid-id-token",
            "auth/invalid-session-cookie-id",
            "auth/id-token-revoked",
            "auth/session-cookie-revoked",
            "auth/user-disabled",
            "auth/user-not-found",
        ]).has(e.code)) return "auth/credential-invalid"

        return "auth/service-unavailable"
    }

    async verifyIdToken(token: string, checkRevoked: boolean = false): Promise<IdPResult<Identity>> {
        try {
            const r = await this.app.verifyIdToken(token, checkRevoked)
            return success({
                provider: this.provider,
                subject: r.sub,
                email: r.email ?? null,
                isVerified: r.email_verified ?? false,
                authTime: new Date(r.auth_time * 1000)
            })
        } catch (e) {
            return fail(this.toError(e), this.isFirebaseError(e) ? `${e.code}: ${e.message}` : undefined)
        }
    }

    async verifySession(session: string, checkRevoked: boolean = false): Promise<IdPResult<Identity>> {
        try {
            const r = await this.app.verifySessionCookie(session, checkRevoked)
            return success({
                provider: this.provider,
                subject: r.sub,
                email: r.email ?? null,
                isVerified: r.email_verified ?? false,
                authTime: new Date(r.auth_time * 1000)
            })
        } catch (e) {
            return fail(this.toError(e), this.isFirebaseError(e) ? `${e.code}: ${e.message}` : undefined)
        }
    }

    async createSession(token: string): Promise<IdPResult<string>> {
        // verify with revocation check first
        const verified = await this.verifyIdToken(token, true)
        if (!verified.success)
            return verified
        // check auth time
        if (Date.now() - verified.data.authTime.getTime() > config.defaults.idp.sessionMaxSignInAgeMs)
            return fail("auth/credential-stale")
        // mint the cookie
        try {
            const cookie = await this.app.createSessionCookie(token, { expiresIn: config.defaults.idp.sessionDurationMs })
            return success(cookie)
        } catch (e) {
            return fail(this.toError(e), this.isFirebaseError(e) ? `${e.code}: ${e.message}` : undefined)
        }
    }

    async revokeAllSessions(subject: string): Promise<IdPResult<null>> {
        try {
            await this.app.revokeRefreshTokens(subject)
            return success(null)
        } catch (e) {
            if (this.isFirebaseError(e) && e.code === "auth/user-not-found")
                return success(null)
            return fail(this.toError(e), this.isFirebaseError(e) ? `${e.code}: ${e.message}` : undefined)
        }
    }

    classify(credential: string): IdPCredentialKind | null {
        const parts = credential.split(".")
        if (parts.length !== 3)
            return null
        try {
            const { iss } = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"))
            if (iss === `https://securetoken.google.com/${this.projectId}`)
                return "id-token"
            if (iss === `https://session.firebase.google.com/${this.projectId}`)
                return "session"
        } catch {}
        return null
    }
}