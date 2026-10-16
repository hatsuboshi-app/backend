import { AuthProvider, AuthUserIdentity } from "@hatsuboshi/types/auth"
import { Result } from "@hatsuboshi/types"

export type IdPCredentialKind = "id-token" | "session"

export interface Identity extends AuthUserIdentity {
    email: string | null
    isVerified: boolean
    authTime: Date
}

export type IdPResult<T> = Result<T, IdPError>

export type IdPError = `auth/${
    | "credential-invalid"
    | "credential-stale"
    | "credential-expired"
    | "service-unavailable"
}`

export default interface IIdPService {
    provider: AuthProvider

    verifyIdToken(token: string, checkRevoked?: boolean): Promise<IdPResult<Identity>>
    verifySession(session: string, checkRevoked?: boolean): Promise<IdPResult<Identity>>
    createSession(token: string): Promise<IdPResult<{ session: string, expiresAt: string }>>
    revokeAllSessions(subject: string): Promise<IdPResult<null>>
    classify(credential: string): IdPCredentialKind | null
}
