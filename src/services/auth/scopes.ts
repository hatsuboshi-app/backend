import {
    AuthContentResource, AuthContentVerb,
    AuthOwnedResource, AuthOwnedVerb,
    AuthRole,
    AuthRoleScopeMapping, AuthScope, AuthScopePattern
} from "@hatsuboshi/types/auth"

const CONTENT_RESOURCES = [
    "auditionEffect",
    "auditionTerminology",
    "character",
    "pdrinks",
    "pidol",
    "pitem",
    "skill",
    "supportCard"
] as const satisfies readonly AuthContentResource[]

const CONTENT_VERBS = [
    "history",
    "create",
    "translate",
    "update",
    "delete"
] as const satisfies readonly AuthContentVerb[]

const OWNED_RESOURCES = [
    "user",
    "apikey"
] as const satisfies readonly AuthOwnedResource[]

const OWNED_VERBS = [
    "read",
    "create",
    "update",
    "delete"
] as const satisfies readonly AuthOwnedVerb[]

export const ALL_SCOPES: readonly AuthScope[] = [
    ...CONTENT_RESOURCES.flatMap(r => CONTENT_VERBS.map(v => `${r}:${v}` as const)),
    ...OWNED_RESOURCES.flatMap(r => OWNED_VERBS.map(v => `${r}:${v}` as const))
]

export const ROLES = [
    "user",
    "translator",
    "maintainer",
    "admin"
] as const satisfies readonly AuthRole[]

export const ROLE_SCOPES: AuthRoleScopeMapping = {
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

export function scopeMatches(pattern: AuthScopePattern, scope: AuthScope): boolean {
    if (pattern === "*")
        return true
    const [pr, pv] = pattern.split(":")
    const [sr, sv] = scope.split(":")
    const group = (OWNED_RESOURCES as readonly string[]).includes(sr) ? "owned": "content"
    return (pr === sr || pr === group) && (pv === sv || pv === "*")
}

export function expandScopes(patterns: readonly AuthScopePattern[]): AuthScope[] {
    return ALL_SCOPES.filter(s => patterns.some(p => scopeMatches(p, s)))
}
