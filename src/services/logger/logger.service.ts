export default interface ILoggerService {
    debug(message: any): void
    info(message: any): void
    warn(message: any): void
    error(message: any): void
}