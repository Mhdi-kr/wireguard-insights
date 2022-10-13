<template>
    <div class="h-screen flex items-center justify-center">
        <n-card class="w-96 m-4">
            <span class="w-full block mb-4 text-center select-none text-4xl">🐉</span>
            <n-alert v-if="error" class="mb-4" title="login failed" type="error" />
            <n-input size="large" v-model:value="username" placeholder="username" class="mb-4" />
            <n-input size="large" type="password" v-model:value="password" placeholder="password" class="mb-4" />
            <n-button :loading="isLoading" @click="onLoginButtonClicked" size="large" block> login </n-button>
        </n-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NCard, NButton, NAlert } from 'naive-ui'
import { useAxios } from '@vueuse/integrations/useAxios'
import endpoints from '../endpoints'
import { useRouter } from 'vue-router'

const router = useRouter()
const password = ref('')
const username = ref('')

const { execute, isLoading, response, error } = useAxios(
    endpoints.LOGIN,
    {
        withCredentials: true,
        method: 'POST',
    },
    { immediate: false }
)

const onLoginButtonClicked = async () => {
    await execute({ data: { username: username.value, password: password.value } })
    return response.value?.status === 200 ? router.replace('/app/clients') : null
}
</script>
