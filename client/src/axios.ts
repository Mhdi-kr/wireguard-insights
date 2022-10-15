import axios from "axios";
import router from "./router";

export const instance = axios.create({
    withCredentials: true,
    baseURL: import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:5000',
})

instance.interceptors.response.use((response) => response, async (error) => {
    if (error.response.status === 401) {
        await router.replace('/login')
    }
})