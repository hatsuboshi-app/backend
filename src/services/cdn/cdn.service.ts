import { Result } from "@hatsuboshi/types";

export type FileMetadata = {
    key: string
    href: string
    lastModified: string
    size: number
}

export default interface ICDNService {
    domain: string

    put(file: Buffer, key: string): Promise<string>
    get(key: string): Promise<Result<FileMetadata>>
    list(): Promise<FileMetadata[]>
    delete(key: string): Promise<boolean>
}