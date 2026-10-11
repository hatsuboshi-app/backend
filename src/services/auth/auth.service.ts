import { Result } from "@hatsuboshi/types"
import { User } from "@hatsuboshi/types/auth"
import IIdPService, { IdPError } from "@/services/auth/idp/idp.service";
import { APIKeyError } from "@/services/auth/api-key/api-key.service";

export type AuthContext =
| {
    kind: "session" | "id-token"
    user: User
    authTime: Date
    apiKeyId?: never
  }
| {
    kind: "api-key"
    user: User
    authTime?: never
    apiKeyId: string
  }

export type AuthResult<T> = Result<T, AuthError>

export type AuthError = `auth/${
    | "credential-missing"
    | "credential-malformed"
    | "user-not-registered"
    | "user-disabled"
}`  | IdPError
    | APIKeyError

export class AuthService {
    idp: IIdPService

    constructor(idp: IIdPService) {
        this.idp = idp
    }

    async authenticate(claim?: string): Promise<AuthResult<AuthContext>> {
        throw Error("")
    }
}