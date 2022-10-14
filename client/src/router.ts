import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import ClientsView from './pages/ClientsView.vue'
import DiagnoseView from './pages/DiagnoseView.vue'
import LogsView from './pages/LogsView.vue'
import LoginView from './pages/LoginView.vue'
import AppView from './pages/AppView.vue'

const routes: RouteRecordRaw[] = [
    {
        name: 'login',
        path: '/login',
        component: LoginView,
    },
    {
        name: 'app',
        path: '/app',
        component: AppView,
        children: [
            {
                name: 'clients',
                path: 'clients',
                component: ClientsView,
            },
            {
                name: 'diagnose',
                path: 'diagnose',
                component: DiagnoseView
            },
            {
                name: 'logs',
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

// guard router to always point to the clients view if no other route was found
router.afterEach((to) => {
    if (!to.name) return router.replace('/app/clients')
})

export default router