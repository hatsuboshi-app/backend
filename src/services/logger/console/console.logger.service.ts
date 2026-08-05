import ILoggerService from "@/services/logger/logger.service"

export default class ConsoleLoggerService implements ILoggerService {
    debug(message: string): void {
        console.debug(message)
    }
    info(message: string): void {
        console.info(message)
    }
    warn(message: string): void {
        console.warn(message)
    }
    error(message: string): void {
        console.error(message)
    }
}