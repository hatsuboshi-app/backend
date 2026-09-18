import { AuthProvider, ISession, Session, User } from "@hatsuboshi/types/auth"
import { New, Result } from "@hatsuboshi/types"
import IRepositoryService from "@/services/repository/repository.service"
import { HASH_REPRESENTATION, SESSION_REFRESH_TIME } from "@/consts"
import { randomBytes } from "node:crypto"
import ILoggerService from "@/services/logger/logger.service"
import InternalServerError from "@/errors/InternalServerError"
import HTTPError from "@/errors/HTTPError"
import BadRequestError from "@/errors/BadRequestError"
import UnauthorizedError from "@/errors/UnauthorizedError"
import ForbiddenError from "@/errors/ForbiddenError"
import NotFoundError from "@/errors/NotFoundError"

export interface SessionMeta {
    ip?: string
    userAgent?: string
}

export interface SessionResult {
    session: Session
    token: string
}

export interface AuthIdentity {
    provider: AuthProvider
    subject: string
    email: string
    emailIdPVerified: boolean
    displayName: string
}

export default class AuthContext {
    authServiceProvider: IAuthService
    repositoryServiceProvider: IRepositoryService
    loggerServiceProvider: ILoggerService

    constructor(authService: IAuthService, repositoryService: IRepositoryService, loggerService: ILoggerService) {
        this.authServiceProvider = authService
        this.repositoryServiceProvider = repositoryService
        this.loggerServiceProvider = loggerService
    }

    private errorFor(code?: string): HTTPError<any> {
        switch (code?.split(" ")[0].trim()) {
            case "TOO_MANY_ATTEMPTS_TRY_LATER":
                return new HTTPError(429)
            case "PASSWORD_LOGIN_DISABLED":
                return new InternalServerError("Password login disabled.")
            case "OPERATION_NOT_ALLOWED":
                return new InternalServerError("Operation not allowed.")
            default:
                if (code) this.loggerServiceProvider.warn(code)
                return new UnauthorizedError()
        }
    }

    private async completeSignUp(a: AuthIdentity): Promise<User> {
        if (a.provider !== "email" && !a.emailIdPVerified) {
            throw new ForbiddenError("Unverified email on new sign-in method.")
        }
        const r = await this.repositoryServiceProvider.createUser({
            disabledAt: null,
            identities: [{ provider: a.provider, subject: a.subject }],
            displayName: a.displayName,
            displayIcon: null,
            description: null,
            email: a.email,
            verified: a.emailIdPVerified,
            roles: ["user"],
            extraScopes: []
        })
        if (!r.success) {
            throw new InternalServerError("Failed to create user.")
        }
        return r.data
    }

    private async completeSignIn(a: AuthIdentity, meta: SessionMeta): Promise<SessionResult> {
        const ru = await this.repositoryServiceProvider.getUserByIdentity(a.provider, a.subject)
        let u: User
        if (!ru.success) {
            // cannot find existing identity, try finding an existing account with the same email
            const re = await this.repositoryServiceProvider.getUserByEmail(a.email)
            if (re.success) {
                if (a.provider === "email") {
                    // incoming identity is email: do not link incoming identity
                    throw new ForbiddenError("Sign-in with the method you last used to sign-in.")
                }
                if (!a.emailIdPVerified) {
                    // incoming identity is not verified: do not link incoming identity
                    throw new ForbiddenError("Unverified email on new sign-in method.")
                }
                if (!re.data.verified) {
                    // existing identity is not verified:
                    //   - abandon existing identity on User
                    //   - assume new identity
                    const rx = await this.repositoryServiceProvider.updateUser(re.data.id, {
                        identities: [{ provider: a.provider, subject: a.subject }],
                        verified: a.emailIdPVerified
                    })
                    if (!rx.success) throw new InternalServerError("Failed to update user.")
                    const rr = await this.repositoryServiceProvider.deleteUserSessions(re.data.id)
                    if (!rr.success) this.loggerServiceProvider.warn("Failed to revoke all user sessions.")
                    u = rx.data
                } else {
                    // existing identity is verified: link new identity
                    const rx = await this.repositoryServiceProvider.updateUser(re.data.id, {
                        identities: [
                            ...re.data.identities,
                            { provider: a.provider, subject: a.subject }
                        ]
                    })
                    if (!rx.success) throw new InternalServerError("Failed to update user.")
                    u = rx.data
                }
            } else {
                // sign up with IdP path - or fixing a bugged password sign-up process
                u = await this.completeSignUp(a)
            }
        } else {
            u = ru.data
        }
        if (u.disabledAt !== null) throw new UnauthorizedError("Invalid email / password.")
        if (!u.verified) throw new ForbiddenError("Unverified email.")
        return await this.createSession(u, a.provider, meta)
    }

    private async createSession(user: User, provider: AuthProvider, meta: SessionMeta): Promise<SessionResult> {
        const s: New<ISession> = {
            user: user.toJSON(),
            createdVia: provider,
            expiresAt: new Date(Date.now() + SESSION_REFRESH_TIME).toISOString(),
            lastSeenAt: new Date().toISOString(),
            userAgent: meta.userAgent ?? null
        }
        const t = randomBytes(32).toString(HASH_REPRESENTATION)
        const r = await this.repositoryServiceProvider.createSession(s, t, meta.ip)
        if (!r.success) throw new InternalServerError("Failed to create session.")
        return { session: r.data, token: t }
    }

    async signUp(email: string, password: string, displayName: string): Promise<User> {
        const rc = await this.repositoryServiceProvider.getUserByEmail(email)
        if (rc.success) {
            throw new HTTPError(409)
        }
        const ra = await this.authServiceProvider.signUp(email, password, displayName)
        if (!ra.success) {
            switch (ra.message?.split(" ")[0].trim()) {
                case "EMAIL_EXISTS":
                    throw new BadRequestError("Email already exists.")
                case "INVALID_EMAIL":
                case "MISSING_PASSWORD":
                    throw new BadRequestError("Invalid email / password.")
                case "WEAK_PASSWORD":
                case "PASSWORD_DOES_NOT_MEET_REQUIREMENTS":
                    throw new BadRequestError("Password does not meet requirements.")
                default:
                    throw this.errorFor(ra.message)
            }
        }
        const u = await this.completeSignUp(ra.data)
        if (!u.verified) {
            const rv = await this.authServiceProvider.initializeEmailVerification(u.email)
            if (!rv.success) {
                this.loggerServiceProvider.warn(`Failed to send verification email for ${u.email} after sign-up.`)
            }
        }
        return u
    }

    async signIn(email: string, password: string, meta: SessionMeta): Promise<SessionResult> {
        const ra = await this.authServiceProvider.signIn(email, password)
        if (!ra.success) {
            switch (ra.message?.split(" ")[0].trim()) {
                case "INVALID_LOGIN_CREDENTIALS":
                    throw new UnauthorizedError("Invalid email / password.")
                default:
                    throw this.errorFor(ra.message)
            }
        }
        return this.completeSignIn(ra.data, meta)
    }

    async signInWithIdP(provider: Exclude<AuthProvider, "email">, idToken: string, meta: SessionMeta): Promise<SessionResult> {
        const rs = await this.authServiceProvider.signInWithIdP(provider, idToken)
        if (!rs.success) throw this.errorFor(rs.message)
        return this.completeSignIn(rs.data, meta)
    }

    async initializeEmailVerification(email: string): Promise<void> {
        const r = await this.authServiceProvider.initializeEmailVerification(email)
        if (!r.success && r.message?.startsWith("TOO_MANY_ATTEMPTS_TRY_LATER")) throw new HTTPError(429)
        if (!r.success && r.message) this.loggerServiceProvider.warn(r.message)
    }

    async confirmEmailVerification(code: string): Promise<void> {
        // consume oob
        const r = await this.authServiceProvider.confirmEmailVerification(code)
        if (!r.success) {
            switch (r.message?.split(" ")[0].trim()) {
                case "EXPIRED_OOB_CODE":
                case "INVALID_OOB_CODE":
                case "MISSING_OOB_CODE":
                    throw new UnauthorizedError("Invalid verification code.")
                default:
                    throw this.errorFor(r.message)
            }
        }
        const ru = await this.repositoryServiceProvider.getUserByIdentity(r.data.provider, r.data.subject)
        if (!ru.success) throw new NotFoundError()
        const rx = await this.repositoryServiceProvider.updateUser(ru.data.id, { verified: true })
        if (!rx.success) throw new InternalServerError("Failed to update user.")
    }

    async initializePasswordReset(email: string): Promise<void> {
        const r = await this.authServiceProvider.initializePasswordReset(email)
        if (!r.success && r.message?.startsWith("TOO_MANY_ATTEMPTS_TRY_LATER")) throw new HTTPError(429)
        if (!r.success && r.message) this.loggerServiceProvider.warn(r.message)
    }

    async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
        const re = await this.authServiceProvider.confirmPasswordReset(code, newPassword)
        if (!re.success) {
            switch (re.message?.split(" ")[0].trim()) {
                case "EXPIRED_OOB_CODE":
                case "INVALID_OOB_CODE":
                case "MISSING_OOB_CODE":
                    throw new UnauthorizedError("Invalid verification code.")
                case "WEAK_PASSWORD":
                case "PASSWORD_DOES_NOT_MEET_REQUIREMENTS":
                    throw new BadRequestError("Password does not meet requirements.")
                default:
                    throw this.errorFor(re.message)
            }
        }
        const ru = await this.repositoryServiceProvider.getUserByEmail(re.data)
        if (!ru.success) throw new NotFoundError()
        // verifies user upon resetting password
        const rx = await this.repositoryServiceProvider.updateUser(ru.data.id, { verified: true })
        if (!rx.success) throw new InternalServerError("Failed to update user.")
        const rr = await this.repositoryServiceProvider.deleteUserSessions(ru.data.id)
        if (!rr.success) this.loggerServiceProvider.warn("Failed to revoke all user sessions.")
    }
}

export interface IAuthService {
    id: string

    signUp(email: string, password: string, displayName: string):
        Promise<Result<AuthIdentity>>
    signIn(email: string, password: string):
        Promise<Result<AuthIdentity>>
    signInWithIdP(provider: Exclude<AuthProvider, "email">, idToken: string):
        Promise<Result<AuthIdentity>>
    initializeEmailVerification(email: string):
        Promise<Result<null>>
    confirmEmailVerification(code: string):
        Promise<Result<AuthIdentity>>
    initializePasswordReset(email: string):
        Promise<Result<null>>
    confirmPasswordReset(code: string, newPassword: string):
        Promise<Result<string>>
}
