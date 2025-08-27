import ConsoleLoggerService from "@/services/logger/console/console.logger.service"
import ILoggerService from "@/services/logger/logger.service"
import IRepositoryService from "@/services/repository/repository.service"
import LocalRepositoryService from "@/services/repository/local/local.repository.service"
// import AuthContext from "@/services/auth/auth.context"
// import IAuthService from "@/services/auth/auth.service"
// import ICDNService from "@/services/cdn/cdn.service"

export let logger: ILoggerService
export let db: IRepositoryService

switch (process.env.NODE_ENV) {
    case "development":
    case "production": {
        logger = new ConsoleLoggerService()
        db = new LocalRepositoryService()
        break
    }
    default: {
        logger = new ConsoleLoggerService()
        db = new LocalRepositoryService()
        break
    }
}