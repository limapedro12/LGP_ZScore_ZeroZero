export interface Config {
    APP_BASE_ROUTE: string;
    API_HOSTNAME: string;

}

export default {

    APP_BASE_ROUTE: import.meta.env.APP_BASE_ROUTE || '',
    API_HOSTNAME: import.meta.env.API_HOSTNAME || 'http://localhost:8080',

} as Config;
