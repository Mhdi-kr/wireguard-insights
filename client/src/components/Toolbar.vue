<template>
    <n-card size="small">
        <n-space align="center" justify="space-between">
            <div>
                <n-space align="center">
                    <span style="font-size: 2rem; user-select: none">🐉</span>
                    <n-divider vertical />
                    <n-button tertiary round>
                        <template #icon>
                            <n-icon>
                                <add-circle />
                            </n-icon>
                        </template>
                        <span>Add Client</span>
                    </n-button>
                    <n-input @input="handleInput" v-model="query" round placeholder="search for clients" />
                </n-space>
            </div>
            <div>
                <n-space align="center">
                    <n-popover trigger="hover" v-for="resource in stats.resources" :key="resource.name">
                        <template #trigger>
                            <n-progress style="width: 34px" type="circle" :status="calculateStatus(resource.percent)"
                                :percentage="resource.percent">
                                <span class="progress">{{ resource.name }}</span>
                            </n-progress>
                        </template>
                        <span>{{ resource.message }}</span>
                    </n-popover>

                    <n-popover trigger="hover" v-for="destination in stats.ping">
                        <template #trigger>
                            <n-badge dot :type="destination.alive ? 'success' : 'error'">
                                <n-button tertiary circle :type="destination.alive ? 'success' : 'error'">
                                    <n-icon size="16">
                                        <component :is="getIcon(destination.name)" />
                                    </n-icon>
                                </n-button>
                            </n-badge>
                        </template>
                        <span>{{ destination.message || destination.time + "ms" }}</span>
                    </n-popover>
                </n-space>
            </div>
        </n-space>
    </n-card>
</template>

<script lang="ts" setup>
import {
    NButton,
    NPopover,
    NInput,
    NIcon,
    NProgress,
    NDivider,
    NBadge,
    NCard,
    NSpace,
} from "naive-ui";

import { AddCircle, LogoGoogle, Cloud, Shield } from "@vicons/ionicons5";

const calculateStatus = (percent: number) => {
    if (percent < 50) {
        return "success";
    } else if (percent >= 50 && percent < 75) {
        return "warning";
    } else {
        return "error";
    }
};

const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
        case "cloudflare":
            return Cloud;
        case "google":
            return LogoGoogle;
        case "wireguard":
            return Shield;
        default:
            return null;
    }
};

const props = defineProps({
    query: {
        type: String,
        default: () => "",
    },
    stats: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["update:query"]);
const handleInput = (payload) => emit("update:query", payload);
</script>

<style>
.progress {
    text-align: center;
    font-size: 0.4rem;
    user-select: none;
}
</style>
