import ConsoleLoggerService from "@/services/logger/console/console.logger.service"
import ILoggerService from "@/services/logger/logger.service"
// import IRepositoryService from "@/services/repository/repository.service"
// import AuthContext from "@/services/auth/auth.context"
// import IAuthService from "@/services/auth/auth.service"
// import ICDNService from "@/services/cdn/cdn.service"

export let logger: ILoggerService

switch (process.env.NODE_ENV) {
    case "development":
    case "production": {
        logger = new ConsoleLoggerService()
        break
    }
    default: {
        logger = new ConsoleLoggerService()
        break
    }
}
