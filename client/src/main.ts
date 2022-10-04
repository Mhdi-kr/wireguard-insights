import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const BASE_URL = import.meta.env
console.error(BASE_URL)
export const CLIENTS = BASE_URL + 'clients'
export const DIAGNOSTICS = BASE_URL + 'diagnostic'

createApp(App).use(router).mount('#app')
