import { createRouter, createWebHashHistory } from 'vue-router'

import ClientsView from './pages/ClientsView.vue'
import DiagnoseView from './pages/DiagnoseView.vue'
import LogsView from './pages/LogsView.vue'

const routes = [
    {
        path: '/clients',
        component: ClientsView,
    },
    {
        path: '/diagnose',
        component: DiagnoseView
    },
    {
        path: '/logs',
        component: LogsView
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router