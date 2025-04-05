export interface Config {
    APP_BASE_ROUTE: string;
    API_HOSTNAME: string;
}

export default {
    APP_BASE_ROUTE: import.meta.env.VITE_APP_BASE_ROUTE,
    API_HOSTNAME: import.meta.env.VITE_API_HOSTNAME,
} as Config;
