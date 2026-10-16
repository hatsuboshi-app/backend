import { IdPError } from "@/services/auth/idp/idp.service"
import { AuthError } from "@/services/auth/auth.service"
import { APIKeyError } from "@/services/auth/api-key/api-key.service"
import { ObjectStoreError } from "@/services/object-store/object-store.service"
import { RepositoryError } from "@/services/repository/repository.service"

export type HTTPErrorStatus =
    | 400 | 401 | 403 | 404 | 409 | 422 | 429
    | 500 | 502 | 503 | 504

export type Error =
    | AuthError | IdPError | APIKeyError
    | ObjectStoreError
    | RepositoryError

export type ErrorMapping = Record<Error, HTTPErrorStatus>

export type ErrorWithStatus<S extends HTTPErrorStatus, E extends Error = Error> =
    E extends unknown
        ? (typeof ERROR_MAPPING)[E] extends S ? E : never
        : never

export const ERROR_MAPPING = {
    "db/not-found":                 404,    // RepositoryService
    "db/already-exists":            409,    // RepositoryService
    "auth/email-unverified":        403,    // AuthService
    "auth/user-not-registered":     403,    // AuthService
    "auth/user-disabled":           403,    // AuthService
    "auth/credential-missing":      401,    // AuthService
    "auth/credential-malformed":    401,    // AuthService
    "auth/api-key-not-allowed":     403,    // AuthService
    "auth/session-not-allowed":     403,    // AuthService
    "auth/insufficient-scope":      403,    // AuthService
    "auth/credential-invalid":      401,    // IdPService
    "auth/credential-stale":        401,    // IdPService
    "auth/credential-expired":      401,    // IdPService
    "auth/service-unavailable":     503,    // IdPService
    "":                             500,    // Placeholder
} as const satisfies ErrorMapping

export type UnauthorizedAuthError =
    | "auth/credential-missing"
    | "auth/credential-malformed"
    | "auth/credential-invalid"
    | "auth/credential-stale"
    | "auth/credential-expired"

export type ForbiddenAuthError =
    | "auth/email-unverified"
    | "auth/user-not-registered"
    | "auth/user-disabled"
    | "auth/api-key-not-allowed"
    | "auth/session-not-allowed"
    | "auth/insufficient-scope"

type Equals<A, B>           = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false
type Assert<T extends true> = T
type _401                   = Assert<Equals<UnauthorizedAuthError, ErrorWithStatus<401, AuthError>>>
type _403                   = Assert<Equals<ForbiddenAuthError, ErrorWithStatus<403, AuthError>>>
