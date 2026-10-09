import { AuthProvider } from "@hatsuboshi/types/auth"
import { Result } from "@hatsuboshi/types"

export interface AuthIdentity {
    provider: AuthProvider
    subject: string
    email: string
    isVerified: boolean
}

export type AuthResult<T> = Result<T, AuthError>

export type AuthError =
    | ""

export interface IAuthService {
    verifyToken(token: string): AuthResult<AuthIdentity>
}
