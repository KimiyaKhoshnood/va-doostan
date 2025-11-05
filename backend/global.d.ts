declare namespace NodeJS {
  interface ProcessEnv {
    URI_Mongodb: string,
    JWT_SECRET: string,
    JWT_REFRESH_SECRET: string,
    JWT_EXPIRES_IN: StringValue | number
  }
}