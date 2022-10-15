<template>
    <section>
        <n-modal v-model:show="isNewClientModalShown" title="New Client">
            <n-card title="New Client" style="width: 300px; max-width: 600px" role="dialog" :bordered="false">
                <n-input
                    class="mb-2 mt-2"
                    :status="(newClientFormStatusList.name as any)"
                    clearable
                    v-model:value="newClientForm.name"
                    type="text"
                    placeholder="Client name"
                />
                <n-input
                    class="mb-2"
                    clearable
                    :status="(newClientFormStatusList.excludeIps as any)"
                    v-model:value="newClientForm.excludeIps"
                    type="text"
                    placeholder="Exclude IPs"
                />
                <div class="flex">
                    <n-input
                        class="mr-1"
                        :status="(newClientFormStatusList.endpointIp as any)"
                        clearable
                        v-model:value="newClientForm.endpointIp"
                        type="text"
                        placeholder="Endpoint IP"
                    />
                    <n-input
                        class="ml-1"
                        :status="(newClientFormStatusList.endpointPort as any)"
                        v-model:value="newClientForm.endpointPort"
                        clearable
                        type="text"
                        placeholder="Endpoint Port"
                    />
                </div>
                <template #footer>
                    <div class="flex items-center justify-end">
                        <n-button class="mx-2" @click="onNewClientClosed">close</n-button>
                        <n-button type="success" @click="onNewClientConfirmedClicked" :disabled="!isNewClientFormValid">
                            confirm</n-button
                        >
                    </div>
                </template>
            </n-card>
        </n-modal>
        <n-card size="small" class="mb-4">
            <n-space align="center" :wrap="false" justify="space-between">
                <n-input v-model:value="query" @input="onQueryChanged" round placeholder="Search by name or IP" />
                <n-button @click="isNewClientModalShown = true" tertiary round>
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
import { h, defineProps, defineEmits, ref, reactive, computed } from 'vue'
import type { Component } from 'vue'
import { NButton, NDataTable, NIcon, NTag, NDropdown, NCard, NInput, NSpace, NModal, useMessage } from 'naive-ui'
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
import endpoints from '../endpoints'
import { useAxios } from '@vueuse/integrations/useAxios'

const renderIcon = (icon: Component) => {
    return () => {
        return h(NIcon, null, {
            default: () => h(icon),
        })
    }
}

const message = useMessage()

// TODO: make a new namespace/component to isolate newClient business

const isIpv4Valid = (ipv4: string) => /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(ipv4)

const isNumberOnly = (str: string) => /^[0-9]*$/.test(str)

const newClientForm = reactive({
    name: '',
    excludeIps: '',
    endpointIp: '',
    endpointPort: '',
})

const onNewClientClosed = () => {
    isNewClientModalShown.value = false
    Object.assign(newClientForm, {
        name: '',
        excludeIps: '',
        endpointIp: '',
        endpointPort: '',
    })
}

const isNewClientFormValid = computed(() => !Object.values(validations.value).includes(false))

const validations = computed(() => ({
    name: !newClientForm.name.includes(' ') && newClientForm.name.length < 15 && newClientForm.name.length > 0, // name should not have contain spaces and be less than 15 chars
    excludeIps: Boolean(
        newClientForm.excludeIps.length === 0
            ? true
            : !newClientForm.excludeIps
                  .split(',')
                  .map((i) => String(i).trim())
                  .map(isIpv4Valid)
                  .includes(false)
    ), // comma separated valid ipv4s, not required
    endpointIp: isIpv4Valid(newClientForm.endpointIp), // single valid ipv4
    endpointPort:
        newClientForm.endpointPort.length > 0 &&
        isNumberOnly(newClientForm.endpointPort) &&
        Number(newClientForm.endpointPort) < 65535, // number only, required
}))

const newClientFormStatusList = computed(() => ({
    name: validations.value.name ? 'success' : 'error',
    excludeIps: validations.value.excludeIps ? 'success' : 'error',
    endpointIp: validations.value.endpointIp ? 'success' : 'error',
    endpointPort: validations.value.endpointPort ? 'success' : 'error',
}))

const isNewClientModalShown = ref(false)

const onNewClientConfirmedClicked = async () => {
    if (!isNewClientFormValid) return
    const payload = {
        name: newClientForm.name,
        excludeIps:
            newClientForm.excludeIps.length > 0
                ? newClientForm.excludeIps.split(',').map((i) => String(i).trim())
                : undefined,
        endpointIp: newClientForm.endpointIp,
        endpointPort: newClientForm.endpointPort,
    }
    const { response } = await useAxios(endpoints.CLIENTS, { withCredentials: true, data: payload })
    if (response.value.status === 200) {
        onNewClientClosed()
        message.success('client created successfully')
    } else {
        message.error('client creation failed')
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
