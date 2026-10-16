import { IdPEC } from "@/services/auth/idp/idp.service"
import { AuthEC } from "@/services/auth/auth.service"
import { APIKeyEC } from "@/services/auth/api-key/api-key.service"
import { ObjectStoreEC } from "@/services/object-store/object-store.service"
import { RepositoryEC } from "@/services/repository/repository.service"

export type ErrorStatus =
    | 400 | 401 | 403 | 404 | 409 | 422 | 429
    | 500 | 501 | 503

export type ErrorMapping = Record<EC, ErrorStatus>

export type ErrorWithStatus<S extends ErrorStatus, E extends EC = EC> = E extends unknown
    ? (typeof ERROR_MAPPING)[E] extends S ? E : never
    : never

export type CoreEC = `core/${
    | "invalid-body"
    | "validation-failed"
    | "internal-error"
    | "not-implemented"
}`

export type EC =
    | CoreEC
    | AuthEC
    | IdPEC
    | APIKeyEC
    | ObjectStoreEC
    | RepositoryEC

export const ERROR_MAPPING = {
    "core/invalid-body":            400,    // Core
    "core/validation-failed":       422,    // Core
    "core/internal-error":          500,    // Core
    "core/not-implemented":         501,    // Core
    "db/not-found":                 404,    // RepositoryService,   APIKeyService
    "db/already-exists":            409,    // RepositoryService
    "db/is-referenced":             409,    // RepositoryService
    "db/bad-reference":             500,    // RepositoryService
    "auth/email-unverified":        403,    // AuthService
    "auth/user-not-registered":     403,    // AuthService
    "auth/user-disabled":           403,    // AuthService
    "auth/api-key-not-allowed":     403,    // AuthService
    "auth/session-not-allowed":     403,    // AuthService
    "auth/insufficient-scope":      403,    // AuthService
    "auth/credential-missing":      401,    // AuthService
    "auth/credential-malformed":    401,    // AuthService,         APIKeyService
    "auth/credential-invalid":      401,    // IdPService,          APIKeyService
    "auth/credential-expired":      401,    // IdPService,          APIKeyService
    "auth/credential-stale":        401,    // IdPService
    "auth/service-unavailable":     503,    // IdPService,          APIKeyService
    "":                             500,    // Placeholder
} as const satisfies ErrorMapping

// all 400 ECs
export type BadRequestEC =
    | "core/invalid-body"

// all 401 ECs
export type UnauthorizedEC =
    | "auth/credential-missing"
    | "auth/credential-malformed"
    | "auth/credential-invalid"
    | "auth/credential-stale"
    | "auth/credential-expired"

// all 403 ECs
export type ForbiddenEC =
    | "auth/email-unverified"
    | "auth/user-not-registered"
    | "auth/user-disabled"
    | "auth/api-key-not-allowed"
    | "auth/session-not-allowed"
    | "auth/insufficient-scope"

// all 404 ECs
export type NotFoundEC =
    | "db/not-found"

// all 409 ECs
export type ConflictEC =
    | "db/already-exists"
    | "db/is-referenced"

// all 422 ECs
export type UnprocessableEC =
    | "core/validation-failed"

// assertions for type safety
type Equals<A, B>           = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false
type Assert<T extends true> = T
type _400                   = Assert<Equals<BadRequestEC, ErrorWithStatus<400>>>
type _401                   = Assert<Equals<UnauthorizedEC, ErrorWithStatus<401>>>
type _403                   = Assert<Equals<ForbiddenEC, ErrorWithStatus<403>>>
type _404                   = Assert<Equals<NotFoundEC, ErrorWithStatus<404>>>
type _409                   = Assert<Equals<ConflictEC, ErrorWithStatus<409>>>
type _422                   = Assert<Equals<UnprocessableEC, ErrorWithStatus<422>>>
