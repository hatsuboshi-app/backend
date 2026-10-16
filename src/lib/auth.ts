import { Request } from "express"
import { AuthContext } from "@/services/auth/auth.service"
import { Security as TsoaSecurity } from "tsoa"
import { auth } from "@/services"
import ControllerError from "@/lib/errors"
import { AuthScope } from "@hatsuboshi/types/auth"
import config from "@/lib/config"

export type SecurityName = "bearer" | "user" | "sensitive"

export const Security: {
    (name: SecurityName, scopes?: AuthScope[]): ClassDecorator & MethodDecorator
} = TsoaSecurity

export async function expressAuthentication(req: Request, securityName: string, scopes: string[] = []): Promise<AuthContext> {
    const r = await auth.authenticate(req.headers.authorization)
    if (!r.success)
        throw new ControllerError(r.error, r.message)
    const ctx = r.data

    const name = securityName as SecurityName
    switch (name) {
        case "bearer":
            break
        case "sensitive": {
            if (ctx.kind !== "api-key" && Date.now() - ctx.authTime.getTime() > config.defaults.auth.sensitiveMaxAgeMs)
                throw new ControllerError("auth/credential-stale")
        } // falls through
        case "user": {
            if (ctx.kind === "api-key")
                throw new ControllerError("auth/api-key-not-allowed")
        } break
        default: {
            const _: never = name
            throw new Error(`Unknown security scheme "${securityName}"`)
        }
    }

    const missing = scopes.filter(s => !ctx.scopes.includes(s as AuthScope))
    if (missing.length > 0)
        throw new ControllerError("auth/insufficient-scope", undefined, { missing })

    return ctx
}

export function isOwner<T extends { userId: string }>(ctx: AuthContext, obj: T): boolean {
    return ctx.user.id === obj.userId
}