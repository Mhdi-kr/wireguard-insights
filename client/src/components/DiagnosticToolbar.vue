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
                </n-space>
            </div>
            <div>
                <n-space align="center">
                    <n-popover trigger="hover">
                        <template #trigger>
                            <n-progress style="width: 34px" type="circle" status="success" :percentage="25">
                                <span style="text-align: center; font-size: 0.4rem; user-select: none">CPU</span>
                            </n-progress>
                        </template>
                        <span> 10% </span>
                    </n-popover>
                    <n-popover trigger="hover">
                        <template #trigger>
                            <n-progress style="width: 34px" type="circle" status="success" :percentage="25">
                                <span style="text-align: center; font-size: 0.4rem; user-select: none">RAM</span>
                            </n-progress>
                        </template>
                        <span> 10% </span>
                    </n-popover>
                    <n-popover trigger="hover">
                        <template #trigger>
                            <n-progress style="width: 34px" type="circle" status="success" :percentage="25">
                                <span style="text-align: center; font-size: 0.4rem; user-select: none">NET</span>
                            </n-progress>
                        </template>
                        <span> 10% </span>
                    </n-popover>
                    <n-popover trigger="hover" v-for="item in diagnostics">
                        <template #trigger>
                            <n-badge dot :type="item.status ? 'success' : 'error'">
                                <n-button tertiary circle :type="item.status ? 'success' : 'error'">
                                    <n-icon size="16">
                                        <component :is="item.icon" />
                                    </n-icon>
                                </n-button>
                            </n-badge>
                        </template>
                        <span>{{ item.message }}</span>
                    </n-popover>
                </n-space>
            </div>
        </n-space>
    </n-card>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'
import { NButton, NPopover, NIcon, NProgress, NDivider, NBadge, NCard, NSpace } from 'naive-ui'
import {
    LogoGoogle,
    Cloud,
    Shield,
    AddCircle,
} from '@vicons/ionicons5'

export default defineComponent({
    name: 'DiagnosticToolbar',
    components: {
        LogoGoogle,
        Cloud,
        Shield,
        NSpace,
        NBadge,
        NButton,
        NCard,
        NPopover,
        NIcon,
        NProgress,
        NDivider,
        AddCircle,
    },
    props: {
        diagnostics: {
            type: Array<any>,
            required: true,
        },
    },
})
</script>
