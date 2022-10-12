<template>
    <div>
        <clients-table
            :loading="unref(loading)"
            :clients="filteredClients"
            v-model:query="query"
            @dropdown-item-clicked="handleDropdownItem"
        />
    </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, reactive, unref } from 'vue'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useFetch } from '@vueuse/core'
import endpoints from './../endpoints'
import ClientsTable from '../components/ClientsTable.vue'
import { FormValidationStatus } from 'naive-ui/es/form/src/interface'
const POLLING_INTERVAL = 750 // ms

const clientFetcher = useFetch(endpoints.CLIENTS).json()
const fetchInterval = setInterval(() => {
    if (clientFetcher.isFinished.value) {
        clientFetcher.execute()
    }
}, POLLING_INTERVAL)

const loading = computed(
    () => clients.value.length === 0 && clientFetcher.isFetching
)
const clients = computed(() => {
    if (!clientFetcher.data.value) return []
    const { data } = clientFetcher.data.value
    return data.filter((client) => !!client)
    // console.log(statsFetcher.json().data.value);
})

const pins = ref([])

const handleDropdownItem = (payload) => {
    const { option, row } = payload
    const key = String(option.key).toLocaleLowerCase()
    switch (key) {
        case 'pin':
            const indexOfFound = pins.value.indexOf(row.publicKey)
            return indexOfFound == -1
                ? pins.value.push(row.publicKey)
                : pins.value.splice(indexOfFound, 1)
        default:
            return
    }
}

const query = ref('')

const searchedClients = useFuse(query, clients, {
    fuseOptions: {
        keys: ['client', 'allowedIps'],
        isCaseSensitive: false,
        threshold: 0.2,
    },
    matchAllWhenSearchEmpty: true,
}).results

const filteredClients = computed(() => {
    let clients = searchedClients.value.map((search: { item: any; refIndex: number }) => ({ ...search.item }))
    clients = clients.map((client) => ({
        ...client,
        isPinned: pins.value.find((pk) => pk === client.publicKey) ? true : false,
    }))
    clients.sort((a, b) => b.isPinned - a.isPinned)
    return clients
})

onBeforeUnmount(() => clearInterval(fetchInterval))
</script>
