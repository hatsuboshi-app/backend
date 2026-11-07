import { Result } from "@hatsuboshi/types"

export type ObjectStoreResult<T> = Result<T, ObjectStoreEC>

export type ObjectStoreEC =
    | ""

export default interface IObjectStoreService {
    domain: string

    presignPutUrl(): ObjectStoreResult<null>
}
