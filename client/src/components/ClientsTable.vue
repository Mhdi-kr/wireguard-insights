<template>
    <n-data-table size="small" :loading="loading" :columns="columns" :data="clients" :pagination="{ pageSize: 10 }" :bordered="false" />
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'
import type { Component } from 'vue'
import { NTable, NButton, NDataTable, NIcon, NTag, NDropdown } from 'naive-ui'
import {
    PlugConnected20Filled,
    PlugDisconnected28Regular,
    MoreHorizontal32Filled,
    QrCode24Filled,
    Delete16Regular,
    Document16Regular,
    Edit16Regular,
} from '@vicons/fluent'

const renderIcon = (icon: Component) => {
    return () => {
        return h(NIcon, null, {
            default: () => h(icon),
        })
    }
}

const createColumns = ({ play }) => {
    return [
        {
            title: 'Status',
            key: 'status',
            render(row) {
                return h('div', {}, [
                    h(
                        NButton,
                        { circle: true, secondary: true, type: row.status ? 'success' : 'default' },
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
            render(row) {
                return h('p', {}, String(row.transfer.sent))
            },
        },
        {
            title: 'Upload',
            key: 'transfer.received',
            render(row) {
                return h('p', {}, String(row.transfer.recieved))
            },
        },
        {
            title: 'Public Key',
            key: 'publicKey',
            render(row) {
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
            render(row) {
                return h(NDropdown, { options: dropDownOptions, showArrow: true }, [
                    h(NButton, { circle: true, secondary: true }, h(NIcon, { size: 20 }, [h(MoreHorizontal32Filled)])),
                ])
            },
        },
    ]
}

const dropDownOptions = [
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

export default defineComponent({
    name: 'ClientsTable',
    components: {
        NTable,
        NDataTable,
    },
    setup() {
        return {
            columns: createColumns({
                play(row) {
                    console.log('hello there')
                },
            }),
            pagination: false,
        }
    },
    props: {
        loading: {
            type: Boolean,
            default: () => true,
        },
        clients: {
            type: Array<any>,
            required: true,
        },
    },
})
</script>
