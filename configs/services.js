// Configure los puertos, prefijos y servidores para los servicios de chats
export const WA_PORT = 3003;
export const WA_PREFIX = "wa";
export const WA_SERVER = "http://localhost";
export const FB_PORT = 3002;
export const FB_PORT = "fa";
export const FB_SERVER = "http://localhost";


// NO TOCAR: formateo automatico para los imports
export const WA_URL = `${WA_SERVER}${WA_PORT}/${WA_PREFIX}`;
export const FB_URL = `${FB_SERVER}${FB_PORT}/${FB_PREFIX}`;
export var URLs = {'W' : WA_URL, 'F': FB_URL};