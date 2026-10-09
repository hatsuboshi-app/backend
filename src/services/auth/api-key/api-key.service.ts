import { Result } from "@hatsuboshi/types";

export type APIKeyResult<T> = Result<T, APIKeyError>

export type APIKeyError =
    | ""