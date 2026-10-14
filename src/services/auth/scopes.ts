import {
    AUTH_SCOPE_GROUPS,
    AuthRoleScopeMapping, AuthScope, AuthScopeGroup, AuthScopePattern, IUser
} from "@hatsuboshi/types/auth"

type ScopeGroupDef = { resources: readonly string[], verbs: readonly string[] }
const GROUPS = Object.entries(AUTH_SCOPE_GROUPS) as [AuthScopeGroup, ScopeGroupDef][]

// list of all scopes e.g. pidol:translate, skill:delete, etc.
const ALL_SCOPES: readonly AuthScope[] = GROUPS.flatMap(([, g]) => {
    return g.resources.flatMap(r => {
        return g.verbs.map(v => {
            return `${r}:${v}` as AuthScope
        })
    })
})

// maps each resource to its group e.g. { pdrink: "content", user: "owned" } etc.
const GROUP_OF: Readonly<Record<string, AuthScopeGroup>> = Object.fromEntries(
    GROUPS.flatMap(([name, g]) => g.resources.map(r => [r, name]))
)

// defines what each role has access to, which patterns
export const ROLE_SCOPES: AuthRoleScopeMapping = {
    user:       [],
    translator: ["content:history", "content:translate"],
    maintainer: ["content:*"],
    admin:      ["*"]
}

// list all patterns granted to a user
export function grantedPatterns(user: Pick<IUser, "roles" | "extraScopes">): AuthScopePattern[] {
    return [...new Set([...user.extraScopes, ...user.roles.flatMap(r => ROLE_SCOPES[r] ?? [])])]
}

// check whether a pattern includes a scope
export function scopeMatches(pattern: AuthScopePattern, scope: AuthScope): boolean {
    if (pattern === "*")
        return true
    const [pr, pv] = pattern.split(":")
    const [sr, sv] = scope.split(":")
    return (pr === sr || pr === GROUP_OF[sr]) && (pv === sv || pv === "*")
}

// convert a list of patterns to a list of corresponding scopes
export function expandScopes(patterns: readonly AuthScopePattern[]): readonly AuthScope[] {
    return ALL_SCOPES.filter(s => patterns.some(p => scopeMatches(p, s)))
}
