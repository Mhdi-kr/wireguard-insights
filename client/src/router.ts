import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import ClientsView from './pages/ClientsView.vue'
import DiagnoseView from './pages/DiagnoseView.vue'
import LogsView from './pages/LogsView.vue'
import LoginView from './pages/LoginView.vue'
import AppView from './pages/AppView.vue'

const routes : RouteRecordRaw[] = [
    {
        path: '/login',
        component: LoginView,
    },
    {
        path: '/app',
        component: AppView,
        children: [
            {
                path: 'clients',
                component: ClientsView,
            },
            {
                path: 'diagnose',
                component: DiagnoseView
            },
            {
                path: 'logs',
                component: LogsView
            }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router