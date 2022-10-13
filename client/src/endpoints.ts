const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL
const CLIENTS = BASE_URL + 'clients'
const STATS = BASE_URL + 'stats'
const LOGIN = BASE_URL + 'login'

export default {
    CLIENTS,
    STATS,
    LOGIN
}