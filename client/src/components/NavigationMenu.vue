<template>
    <n-card size="small">
        <ul class="list-none m-0 p-0">
            <li v-for="item in MENU_LIST" :key="item.link">
                <n-button
                    block
                    class="mb-2 lg:justify-start text-left"
                    :quaternary="isCurrentTab(item) ? false : true"
                    :tertiary="isCurrentTab(item) ? true: false"
                    :type="isCurrentTab(item) ? 'success' : 'default'"
                    @click="toRoute(item)"
                >
                    <span class="hidden lg:block">
                        {{ item.title }}
                    </span>
                    <template #icon>
                        <n-icon>
                            <component :is="item.icon" />
                        </n-icon>
                    </template>
                </n-button>
            </li>
        </ul>
    </n-card>
</template>

<script lang="ts" setup>
import { NCard, NButton, NIcon } from 'naive-ui'
import { Person48Filled, Stethoscope24Filled, Document16Filled } from '@vicons/fluent'

import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const MENU_LIST = [
    {
        title: 'Clients',
        link: '/app/clients',
        icon: Person48Filled,
    },
    {
        title: 'Diagnose',
        link: '/app/diagnose',
        icon: Stethoscope24Filled,
    },
    {
        title: 'Logs',
        link: '/app/logs',
        icon: Document16Filled,
    },
]

const isCurrentTab = (menuItem: { title: string }) =>
    String(menuItem.title).toLowerCase() === String(route.path).replace('/app/', '').toLowerCase() ? true : false

const toRoute = (menuItem: { link: string }) => router.replace(menuItem.link)
</script>
