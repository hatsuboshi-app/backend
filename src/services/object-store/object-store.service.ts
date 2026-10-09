import { Result } from "@hatsuboshi/types"

export type ObjectStoreResult<T> = Result<T, ObjectStoreError>

export type ObjectStoreError =
    | ""

export default interface IObjectStoreService {
    domain: string

    presignPutUrl(): ObjectStoreResult<null>
}
