import ConsoleLoggerService from "@/services/logger/console/console.logger.service"
import ILoggerService from "@/services/logger/logger.service"
import IRepositoryService from "@/services/repository/repository.service"
import LocalRepositoryService from "@/services/repository/local/local.repository.service"
import MongoRepositoryService from "@/services/repository/mongo/mongo.repository.service"
import { AuthService } from "@/services/auth/auth.service"
import { FirebaseIdPService } from "@/services/auth/idp/firebase/firebase.idp.service"
import { LocalIdPService } from "@/services/auth/idp/local/local.idp.service"
import APIKeyService from "@/services/auth/api-key/api-key.service"
import IIdPService from "@/services/auth/idp/idp.service"

export let logger: ILoggerService
export let db: IRepositoryService
export let idp: IIdPService
export let apiKeys: APIKeyService
export let auth: AuthService

const REQUIRED_ENV = [
    "MONGO_SHARED",
    "MONGO_CLUSTER",
    "MONGO_USER",
    "MONGO_PASS",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "S3_REGION",
    "S3_BUCKET",
    "S3_KEY",
    "S3_SECRET"
] as const

type RequiredEnv = Record<typeof REQUIRED_ENV[number], string>

function readRequiredEnv(): RequiredEnv {
    const missing = REQUIRED_ENV.filter(k => !process.env[k])
    if (missing.length > 0)
        throw new Error("Missing required environment variables: " + missing.join(", "))
    return Object.fromEntries(
        REQUIRED_ENV.map(k => {
            return [k, process.env[k]]
        }
    )) as RequiredEnv
}

switch (process.env.API_ENV) {
    case "development":
    case "production": {
        const env = readRequiredEnv()

        logger  = new ConsoleLoggerService()
        db      = new MongoRepositoryService({
                      shared:      env.MONGO_SHARED,
                      cluster:     env.MONGO_CLUSTER,
                      username:    env.MONGO_USER,
                      password:    env.MONGO_PASS })
        idp     = new FirebaseIdPService({
                      projectId:   env.FIREBASE_PROJECT_ID,
                      clientEmail: env.FIREBASE_CLIENT_EMAIL,
                      privateKey:  env.FIREBASE_PRIVATE_KEY })
        apiKeys = new APIKeyService(db)
        auth    = new AuthService(db, idp, apiKeys)
    } break

    case "local": {
        logger  = new ConsoleLoggerService()
        db      = new LocalRepositoryService()
        idp     = new LocalIdPService()
        apiKeys = new APIKeyService(db)
        auth    = new AuthService(db, idp, apiKeys)
    } break

    default: {
        throw new Error(`Unknown API_ENV "${process.env.API_ENV}": expected local, development or production`)
    }
}