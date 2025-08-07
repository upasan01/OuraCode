// env's type defination
declare namespace NodeJS {
    interface ProcessEnv {
        PORT: string,
        MONGO_URL: string
    }
}