declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: number
            API_ENV?: "local" | "development" | "production"
            MONGO_SHARED?: string
            MONGO_CLUSTER?: string
            MONGO_USER?: string
            MONGO_PASS?: string
            S3_REGION?: string
            S3_BUCKET?: string
            S3_KEY?: string
            S3_SECRET?: string
        }
    }
}