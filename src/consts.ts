import {
    AuthAnonymousResource,
    AuthOwnedResource,
    AuthRole,
    AuthRoleScopeMapping,
    AuthVerb
} from "@hatsuboshi/types/auth"
import { createHash } from "node:crypto";

export const AUTH_ROLES = [
    "user",
    "translator",
    "maintainer",
    "admin"
] as const satisfies readonly AuthRole[]

export const AUTH_ANONYMOUS_RESOURCES = [
    "auditionEffect",
    "auditionTerminology",
    "character",
    "pdrinks",
    "pidol",
    "pitem",
    "skill",
    "supportCard"
] as const satisfies readonly AuthAnonymousResource[]

export const AUTH_OWNED_RESOURCES = [
    "user",
    "session",
    "apikey"
] as const satisfies readonly AuthOwnedResource[]

export const AUTH_VERBS = [
    "history",
    "create",
    "translate",
    "update",
    "delete"
] as const satisfies readonly AuthVerb[]

export const HASH_REPRESENTATION = "base64url"

export const HASH_FUNCTION = (token: string): string => {
    return createHash("sha256").update(token).digest(HASH_REPRESENTATION)
}

export const SESSION_REFRESH_TIME = 30 * 24 * 3600 * 1000  // 30 days

export const AUTH_ROLE_SCOPES: AuthRoleScopeMapping = {
    user: [

    ],
    translator: [
        "content:history",
        "content:translate"
    ],
    maintainer: [
        "content:*",
    ],
    admin: [
        "*"
    ]
}
