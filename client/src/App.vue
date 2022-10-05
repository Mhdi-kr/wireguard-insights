<template>
    <n-config-provider :theme="darkTheme">
        <main class="container box-border px-4 md:px-0 pt-4 mx-auto">
            <section class="mb-4">
                <toolbar :stats="stats" />
            </section>
            <section class="flex flex-row">
                <section class="hidden md:block w-1/6 pr-2">
                    <navigation-menu />
                </section>
                <section class="w-full md:w-5/6 md:pl-2">
                    <router-view />
                </section>
            </section>
        </main>
    </n-config-provider>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount } from 'vue'
import { RouterView } from 'vue-router'
import { useFetch } from '@vueuse/core'
import { darkTheme, NConfigProvider } from 'naive-ui'
import Toolbar from './components/Toolbar.vue'
import NavigationMenu from './components/NavigationMenu.vue'
import endpoints from './endpoints'

const POLLING_INTERVAL = 750 // ms

const statsFetcher = useFetch(endpoints.STATS).json()

const stats = computed(() => {
    if (!statsFetcher.data.value) return { resources: {} }
    const { data } = statsFetcher.data.value
    return data
})

const fetchInterval = setInterval(() => {
    if (statsFetcher.isFinished.value) {
        statsFetcher.execute()
    }
}, POLLING_INTERVAL)

onBeforeUnmount(() => clearInterval(fetchInterval))

const resources = computed(() => {
    if (!statsFetcher.data.value) return []
    const {
        data: { serverStats },
    } = statsFetcher.data.value
    return [
        {
            name: 'ram',
        },
    ]
})
</script>
