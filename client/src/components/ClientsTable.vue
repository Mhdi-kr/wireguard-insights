<template>
    <n-data-table 
        size="small" 
        :loading="loading" 
        :columns="columns" 
        :data="clients"
        :pagination="{ pageSize: 10 }" :row-class-name="rowClassName"
        :bordered="false"
    />
</template>

<script lang="ts" setup>
import { h, defineProps, defineEmits } from "vue";
import type { Component } from "vue";
import { NButton, NDataTable, NIcon, NTag, NDropdown } from "naive-ui";
import {
    PlugConnected20Filled,
    PlugDisconnected28Regular,
    MoreHorizontal32Filled,
    QrCode24Filled,
    Delete16Regular,
    Document16Regular,
    Edit16Regular,
    Pin20Regular,
} from "@vicons/fluent";

const renderIcon = (icon: Component) => {
    return () => {
        return h(NIcon, null, {
            default: () => h(icon),
        });
    };
};

const emit = defineEmits(["dropdown-item-clicked"]);

const createColumns = ({ play }: { play: any }) => {
    return [
        {
            title: "Status",
            key: "status",
            render(row: any) {
                return h("div", {}, [
                    h(
                        NButton,
                        {
                            circle: true,
                            secondary: true,
                            type: row.status ? "success" : "default",
                        },
                        h(NIcon, { size: 20 }, [
                            h(row.status ? PlugConnected20Filled : PlugDisconnected28Regular),
                        ])
                    ),
                ]);
            },
        },
        {
            title: "Client",
            key: "client",
        },
        {
            title: "Download",
            key: "transfer.sent",
            render(row: any) {
                return h("p", {}, String(row.transfer.sent));
            },
        },
        {
            title: "Upload",
            key: "transfer.received",
            render(row: any) {
                return h("p", {}, String(row.transfer.recieved));
            },
        },
        {
            title: "Public Key",
            key: "publicKey",
            render(row: any) {
                return h(
                    NTag,
                    { size: "small", round: true },
                    String(row.publicKey).slice(0, 10)
                );
            },
        },
        {
            title: "Endpoint",
            key: "endpoint",
        },
        {
            title: "Allowed IPs",
            key: "allowedIps",
        },
        {
            title: "Last TLS Handshake",
            key: "lastTlsHandshake",
        },
        {
            title: "Action",
            key: "actions",
            render(row: any) {
                return h(
                    NDropdown,
                    {
                        options: dropDownOptions,
                        showArrow: true,
                        onSelect: (_, option) => emit("dropdown-item-clicked", { option, row })
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
                );
            },
        },
    ];
};

const rowClassName = (row) => row.isPinned ? '' : 'not-pinned'

const dropDownOptions = [
    {
        label: "Pin to top",
        key: "PIN",
        icon: renderIcon(Pin20Regular),
    },
    {
        label: "Edit Client",
        key: "EDIT",
        icon: renderIcon(Edit16Regular),
    },
    {
        label: "Download QR Code",
        key: "QR",
        icon: renderIcon(QrCode24Filled),
    },
    {
        label: "Download Config File",
        key: "CONF",
        icon: renderIcon(Document16Regular),
    },
    {
        label: "Revoke Client",
        key: "REVOKE",
        icon: renderIcon(Delete16Regular),
    },
];
const columns = createColumns({
    play(row: any) {
        console.log("hello there");
    },
});

const pagination = false;

const props = defineProps({
    loading: {
        type: Boolean,
        default: () => true,
    },
    clients: {
        type: Array<any>,
        required: true,
    },
});
</script>

<style scoped>
    :deep(.not-pinned) {
        opacity: 0.7;
    }
</style>
