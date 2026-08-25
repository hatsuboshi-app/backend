import ConsoleLoggerService from "@/services/logger/console/console.logger.service"
import ILoggerService from "@/services/logger/logger.service"
import IRepositoryService from "@/services/repository/repository.service"
import LocalRepositoryService from "@/services/repository/local/local.repository.service"
import ProcessEnv = NodeJS.ProcessEnv
import MongoRepositoryService from "@/services/repository/mongo/mongo.repository.service"
// import AuthContext from "@/services/auth/auth.context"
// import IAuthService from "@/services/auth/auth.service"
// import ICDNService from "@/services/cdn/cdn.service"

export let logger: ILoggerService
export let db: IRepositoryService

switch (process.env.API_ENV) {
    case "development":
    case "production": {
        const requiredEnvVars: (keyof ProcessEnv)[] = [
            "MONGO_SHARED", "MONGO_CLUSTER", "MONGO_USER", "MONGO_PASS",
            "S3_REGION", "S3_BUCKET", "S3_KEY", "S3_SECRET"
        ]
        const missingEnvVars: (keyof ProcessEnv)[] = requiredEnvVars.filter(ev => !process.env[ev])
        if (missingEnvVars.length > 0)
            throw new Error("Missing required environment variables: " + missingEnvVars.join(", "))

        logger = new ConsoleLoggerService()
        db = new MongoRepositoryService({
            shared: <string>process.env.MONGO_SHARED,
            cluster: <string>process.env.MONGO_CLUSTER,
            username: <string>process.env.MONGO_USER,
            password: <string>process.env.MONGO_PASS,
        })
        break
    }
    default: {
        logger = new ConsoleLoggerService()
        db = new LocalRepositoryService()
        break
    }
}