// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly API_HOSTNAME: string;
    readonly FEDERAL_LOGIN: string;
    readonly APP_BAUSE_ROUTE:string;
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
    readonly env: ImportMetaEnv
}
