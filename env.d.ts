declare global {
    namespace NodeJS {
        interface ProcessEnv {
            API_ENV?: string
            PORT?: string

            MONGO_SHARED?: string
            MONGO_CLUSTER?: string
            MONGO_USER?: string
            MONGO_PASS?: string

            FIREBASE_PROJECT_ID?: string
            FIREBASE_CLIENT_EMAIL?: string
            FIREBASE_PRIVATE_KEY?: string

            S3_REGION?: string
            S3_BUCKET?: string
            S3_KEY?: string
            S3_SECRET?: string
        }
    }
}

export {}