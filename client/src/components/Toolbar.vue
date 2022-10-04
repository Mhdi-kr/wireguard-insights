<template>
    <n-card size="small">
        <n-space align="center" justify="space-between">
            <n-space align="center" class="select-none text-2xl">
                <span class="text-2xl">🐉</span>
                <span>|</span>
                <span>Wireguard Insights</span>
            </n-space>
            <n-space align="center">
                <n-popover trigger="hover" v-for="resource in stats.resources" :key="resource.name">
                    <template #trigger>
                        <n-progress
                            style="width: 34px"
                            type="circle"
                            :status="calculateStatus(resource.percent)"
                            :percentage="resource.percent"
                        >
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
                    <span>{{ destination.message || destination.time + 'ms' }}</span>
                </n-popover>
            </n-space>
        </n-space>
    </n-card>
</template>

<script lang="ts" setup>
import { NButton, NPopover, NIcon, NProgress, NDivider, NBadge, NCard, NSpace } from 'naive-ui'
import { LogoGoogle, Cloud, Shield } from '@vicons/ionicons5'

const calculateStatus = (percent: number) => {
    if (percent < 50) {
        return 'success'
    } else if (percent >= 50 && percent < 75) {
        return 'warning'
    } else {
        return 'error'
    }
}

const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
        case 'cloudflare':
            return Cloud
        case 'google':
            return LogoGoogle
        case 'wireguard':
            return Shield
        default:
            return null
    }
}

const props = defineProps({
    stats: {
        type: Object,
        required: true,
    },
})
</script>

<style>
.progress {
    text-align: center;
    font-size: 0.4rem;
    user-select: none;
}
</style>
