import ConsoleLoggerService from "@/services/logger/console/console.logger.service"
import ILoggerService from "@/services/logger/logger.service"
import IRepositoryService from "@/services/repository/repository.service"
import LocalRepositoryService from "@/services/repository/local/local.repository.service"
import ProcessEnv = NodeJS.ProcessEnv
import MongoRepositoryService from "@/services/repository/mongo/mongo.repository.service"
import { AuthService } from "@/services/auth/auth.service"
import { FirebaseIdPService } from "@/services/auth/idp/firebase/firebase.idp.service"
import { LocalIdPService } from "@/services/auth/idp/local/local.idp.service"

export let logger: ILoggerService
export let db: IRepositoryService
export let auth: AuthService

switch (process.env.API_ENV) {
    case "development":
    case "production": {
        const requiredEnvVars: (keyof ProcessEnv)[] = [
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
        ]
        const missingEnvVars: (keyof ProcessEnv)[] = requiredEnvVars.filter(ev => !process.env[ev])
        if (missingEnvVars.length > 0) {
            throw new Error("Missing required environment variables: " + missingEnvVars.join(", "))
        }

        logger = new ConsoleLoggerService()
        db = new MongoRepositoryService({
            shared: <string>process.env.MONGO_SHARED,
            cluster: <string>process.env.MONGO_CLUSTER,
            username: <string>process.env.MONGO_USER,
            password: <string>process.env.MONGO_PASS,
        })
        auth = new AuthService(
            new FirebaseIdPService({
                projectId: <string>process.env.FIREBASE_PROJECT_ID,
                clientEmail: <string>process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: <string>process.env.FIREBASE_PRIVATE_KEY
            })
        )
    } break
    default: {
        logger = new ConsoleLoggerService()
        db = new LocalRepositoryService()
        auth = new AuthService(
            new LocalIdPService()
        )
    }
}