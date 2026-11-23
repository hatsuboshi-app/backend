import ILoggerService from "@/services/logger/logger.service"

export default class ConsoleLoggerService implements ILoggerService {
    debug(message: any): void {
        console.debug(message)
    }
    info(message: any): void {
        console.info(message)
    }
    warn(message: any): void {
        console.warn(message)
    }
    error(message: any): void {
        console.error(message)
    }
}