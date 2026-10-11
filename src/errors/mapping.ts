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

export const errorMapping: ErrorMapping = {
    "not-found": 404,
    "": 500,
    "auth/user-not-registered":     403,    // AuthService
    "auth/user-disabled":           403,    // AuthService
    "auth/credential-missing":      401,    // AuthService
    "auth/credential-malformed":    401,    // AuthService
    "auth/credential-invalid":      401,    // IdPService
    "auth/credential-expired":      401,    // IdPService
    "auth/service-unavailable":     500,    // IdPService
} as const satisfies ErrorMapping
