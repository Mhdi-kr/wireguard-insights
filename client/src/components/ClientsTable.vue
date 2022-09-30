<template>
  {{ clients }}
    <n-data-table
    :columns="columns"
    :data="clients"
    :pagination="pagination"
    :bordered="false"
  />

    <n-table :bordered="false" :single-line="false">
        <thead>
            <tr>
                <th>client</th>
                <th>peer</th>
                <th>endpoint</th>
                <th>allowed ips</th>
                <th>last TLS handshake</th>
                <th>Status</th>
                <th>recieved</th>
                <th>sent</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(client, index) in clients" :key="client && client.publicKey">
                <template v-if="client">
                    <td>{{ String(client.client) }}</td>
                    <td>{{ String(client.publicKey).slice(0, 16) }}...</td>
                    <td>{{ client.endpoint }}</td>
                    <td>{{ client.allowedIps }}</td>
                    <td>{{ client.lastTlsHandshake }}</td>
                    <td>{{ client.status ? '✅' : '❌' }}</td>
                    <td>{{ client.transfer.sent }}</td>
                    <td>{{ client.transfer.recieved }}</td>
                </template>
            </tr>
        </tbody>
    </n-table>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'
import { NTable, NButton, useMessage, NDataTable, NIcon } from 'naive-ui'
import { PlugConnected20Filled, PlugDisconnected28Regular } from '@vicons/fluent'

const createColumns = ({ play }) => {
    return [
        {
            title: 'Client',
            key: 'client',
        },
        {
            title: 'Public Key',
            key: 'publicKey',
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
            title: 'Status',
            key: 'status',
            render(row) {
              return h('div', {}, [
                row.status ? h(NIcon, { size: 16}, [h(PlugConnected20Filled)]) : h(NIcon, { size: 16}, [h(PlugDisconnected28Regular)])
              ])
            }
        },
        {
            title: 'Recieved',
            key: 'trasfer.sent',
        },
        {
            title: 'Action',
            key: 'actions',
            render(row) {
                return h(
                    NButton,
                    {
                        strong: true,
                        tertiary: true,
                        size: 'small',
                        onClick: () => play(row),
                    },
                    { default: () => 'Play' }
                )
            },
        },
    ]
}

export default defineComponent({
    name: 'ClientsTable',
    components: {
        NTable,
        NDataTable
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
        clients: {
            type: Array<any>,
            required: true,
        },
    },
})
</script>
