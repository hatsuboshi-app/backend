import { AuthProvider } from "@hatsuboshi/types/auth"
import { Result } from "@hatsuboshi/types"

export interface Identity {
    provider: AuthProvider
    subject: string
    email: string
    isVerified: boolean
    authTime: Date
}

export type IdPResult<T> = Result<T, IdPError>

export type IdPError =
    | ""

export default interface IIdPService {
    provider: AuthProvider

    verifyIdToken(token: string): Promise<IdPResult<Identity>>
    verifySession(session: string): Promise<IdPResult<Identity>>
    createSession(token: string): Promise<IdPResult<string>>
    revokeAllSessions(subject: string): Promise<IdPResult<null>>
}
