declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    API_KEY: string;
    EXTERNAL_SERVICE_URL: string;
  }
}
