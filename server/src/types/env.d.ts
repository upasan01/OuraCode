// env's type defination
declare namespace NodeJS {
    interface ProcessEnv {
        PORT: string,
        MONGO_URL: string,
        UPSTASH_REDIS_REST_URL: string,
        UPSTASH_REDIS_REST_TOKEN: string,
    }
}