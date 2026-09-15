import {
    AuthAnonymousResource,
    AuthOwnedResource,
    AuthRole,
    AuthRoleScopeMapping,
    AuthVerb
} from "@hatsuboshi/types/auth"

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
