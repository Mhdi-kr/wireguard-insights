<template>
    <n-config-provider :theme="darkTheme">
        <router-view />
    </n-config-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { darkTheme, NConfigProvider } from 'naive-ui'
</script>
