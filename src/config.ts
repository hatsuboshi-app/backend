type Config = {
    port: number
    env: string
    defaults: {
        pageSize: number
        idp: {
            sessionMaxSignInAgeMs: number
            sessionDurationMs: number
        }
    }
}

const config: Config = {
    port: Number(process.env.PORT) || 3001,
    env: process.env.API_ENV || 'local',
    defaults: {
        pageSize: 15,
        idp: {
            sessionMaxSignInAgeMs: 5 * 60 * 1000,  // 5 minutes
            sessionDurationMs: 7 * 24 * 60 * 60 * 1000,  // 7 days
        }
    }
}

export default config
