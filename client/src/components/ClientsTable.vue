<template>
    <section>
        <n-card size="small" class="mb-4">
            <n-space align="center" :wrap="false" justify="space-between">
                <n-input
                    v-model:value="query"
                    @input="onQueryChanged"
                    round
                    placeholder="Search by name or IP"
                />
                <n-button tertiary round>
                    <template #icon>
                        <n-icon>
                            <add-circle />
                        </n-icon>
                    </template>
                    <span>Add Client</span>
                </n-button>
            </n-space>
        </n-card>
        <n-card size="small">
            <n-data-table
                class="whitespace-pre"
                size="small"
                :loading="loading"
                :columns="columns"
                :data="clients"
                :pagination="{ pageSize: 9 }"
                :row-class-name="rowClassName"
                :bordered="false"
            />
        </n-card>
    </section>
</template>

<script lang="ts" setup>
import { h, defineProps, defineEmits, ref } from 'vue'
import type { Component } from 'vue'
import { NButton, NDataTable, NIcon, NTag, NDropdown, NCard, NInput, NSpace } from 'naive-ui'
import { AddCircle } from '@vicons/ionicons5'

import {
    PlugConnected20Filled,
    PlugDisconnected28Regular,
    MoreHorizontal32Filled,
    QrCode24Filled,
    Delete16Regular,
    Document16Regular,
    Edit16Regular,
    Pin20Regular,
} from '@vicons/fluent'
import { stringifyQuery } from 'vue-router'

const renderIcon = (icon: Component) => {
    return () => {
        return h(NIcon, null, {
            default: () => h(icon),
        })
    }
}

const emit = defineEmits(['dropdown-item-clicked', 'update:query'])

const createColumns = ({ play }: { play: any }) => {
    return [
        {
            title: 'Status',
            key: 'status',
            render(row: any) {
                return h('div', {}, [
                    h(
                        NButton,
                        {
                            circle: true,
                            secondary: true,
                            type: row.status ? 'success' : 'default',
                        },
                        h(NIcon, { size: 20 }, [h(row.status ? PlugConnected20Filled : PlugDisconnected28Regular)])
                    ),
                ])
            },
        },
        {
            title: 'Client',
            key: 'client',
        },
        {
            title: 'Download',
            key: 'transfer.sent',
            render(row: any) {
                return h('p', {}, String(row.transfer.sent))
            },
        },
        {
            title: 'Upload',
            key: 'transfer.received',
            render(row: any) {
                return h('p', {}, String(row.transfer.recieved))
            },
        },
        {
            title: 'Public Key',
            key: 'publicKey',
            render(row: any) {
                return h(NTag, { size: 'small', round: true }, String(row.publicKey).slice(0, 10))
            },
        },
        {
            title: 'Endpoint',
            key: 'endpoint',
        },
        {
            title: 'Allowed IPs',
            key: 'allowedIps',
        },
        {
            title: 'Last TLS Handshake',
            key: 'lastTlsHandshake',
        },
        {
            title: 'Action',
            key: 'actions',
            render(row: any) {
                return h(
                    NDropdown,
                    {
                        options: dropDownOptions,
                        showArrow: true,
                        onSelect: (_, option) => emit('dropdown-item-clicked', { option, row }),
                    },
                    [
                        h(
                            NButton,
                            {
                                circle: true,
                                secondary: true,
                            },
                            h(NIcon, { size: 20 }, [h(MoreHorizontal32Filled)])
                        ),
                    ]
                )
            },
        },
    ]
}

const onQueryChanged = (val: string) => emit('update:query', val)

const rowClassName = (row) => (row.isPinned ? '' : 'not-pinned')

const dropDownOptions = [
    {
        label: 'Pin to top',
        key: 'PIN',
        icon: renderIcon(Pin20Regular),
    },
    {
        label: 'Edit Client',
        key: 'EDIT',
        icon: renderIcon(Edit16Regular),
    },
    {
        label: 'Download QR Code',
        key: 'QR',
        icon: renderIcon(QrCode24Filled),
    },
    {
        label: 'Download Config File',
        key: 'CONF',
        icon: renderIcon(Document16Regular),
    },
    {
        label: 'Revoke Client',
        key: 'REVOKE',
        icon: renderIcon(Delete16Regular),
    },
]
const columns = createColumns({
    play(row: any) {
        console.log('hello there')
    },
})

const props = defineProps({
    loading: {
        type: Boolean,
        default: () => true,
    },
    clients: {
        type: Array<any>,
        required: true,
    },
    query: {
        type: String,
    },
})
</script>

<style scoped>
:deep(.not-pinned) {
    opacity: 0.7;
}
</style>
