import IAuthService from "@/services/auth/auth.service"

export default class AuthContext {
    private readonly authServiceProvider: IAuthService

    constructor(authProvider: IAuthService) {
        this.authServiceProvider = authProvider
    }
}