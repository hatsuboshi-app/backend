type Config = {
    port: number
    defaults: {
        pageSize: number
        idp: {
            sessionMaxSignInAgeMs: number
            sessionDurationMs: number
        }
        apiKey: {
            tag: string
            prefixLength: number
            suffixLength: number
            secretLength: number
            lastUsedThrottleMs: number
        }
    }
}

const config: Config = {
    port: Number(process.env.PORT) || 3001,
    defaults: {
        pageSize: 15,
        idp: {
            sessionMaxSignInAgeMs: 5 * 60 * 1000,           // 5 minutes
            sessionDurationMs: 7 * 24 * 60 * 60 * 1000,     // 7 days
        },
        apiKey: {
            tag: "htbs",
            prefixLength: 12,
            suffixLength: 4,
            secretLength: 48,
            lastUsedThrottleMs: 60 * 1000                   // 60 seconds
        }
    }
}

export default config
