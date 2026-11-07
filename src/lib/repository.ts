import { randomInt } from "node:crypto"
import { RepositoryResource } from "@/services/repository/repository.service"
import { IPersistentObject } from "@hatsuboshi/types"

export const ID_PREFIXES = {
    auditionEffect: "e",
    auditionTerminology: "t",
    character: "c",
    pDrink: "d",
    pIdol: "i",
    pItem: "m",
    skill: "s",
    supportCard: "a",
    user: "u",
    apiKey: "k"
} as const satisfies Record<RepositoryResource, string>

export function newId(resource: RepositoryResource, length: number = 12): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let id: string = ID_PREFIXES[resource]
    for (let i = 0; i < length - 1; i++)
        id += chars[randomInt(chars.length)]
    return id
}

export function newPersistentObject(resource: RepositoryResource): IPersistentObject {
    const now = new Date().toISOString()
    return {
        id: newId(resource),
        createdAt: now,
        updatedAt: now
    }
}