<template>
    <n-card>
        <n-space>
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
    </n-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { NButton, NPopover, NIcon, NBadge, NCard, NSpace } from 'naive-ui'
import { LogoGoogle, Cloud, Shield } from '@vicons/ionicons5'

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
    },
    props: {
        diagnostics: {
            type: Array<any>,
            required: true
        }
    }
})
</script>
