<template>
    <n-config-provider :theme="darkTheme">
        <div class="container">
            <diagnostic-toolbar class="toolbar" :diagnostics="diagnostic" />
            <clients-table :loading="isLoading" :clients="peers" />
        </div>
    </n-config-provider>
</template>

<style scoped>
    .container {
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }
    .toolbar {
        margin-bottom: 1rem;
    }
</style>

<script lang="ts">
import { defineComponent, shallowRef } from 'vue'
import { darkTheme, NConfigProvider } from 'naive-ui'
import { LogoGoogle, Cloud, Shield } from '@vicons/ionicons5'
import ClientsTable from './components/ClientsTable.vue'
import DiagnosticToolbar from './components/DiagnosticToolbar.vue'
import endpoints from './endpoints'

export default defineComponent({
    components: {
        NConfigProvider,
        ClientsTable,
        DiagnosticToolbar,
    },
    setup() {
        return {
            darkTheme,
        }
    },
    data() {
        return {
            diagnostic: [],
            isLoading: false,
            isFetching: false,
            peers: [],
            polling: null,
        }
    },
    methods: {
        pollData: function () {
            this.polling = setInterval(() => {
                if (!this.isFetching) {
                    this.isFetching = true
                } else return
                fetch(endpoints.CLIENTS)
                    .then((res) => {
                        this.isFetching = false
                        return res.json()
                    })
                    .then(({ data }) => (this.peers = data.filter((i) => !!i)))
                fetch(endpoints.DIAGNOSTICS)
                    .then((res) => {
                        this.isFetching = false
                        return res.json()
                    })
                    .then(({ data }) => {
                        this.diagnostic = [
                            {
                                message: 'wireguard service',
                                status: data.serviceStatus,
                                icon: shallowRef(Shield),
                            },
                            {
                                message: 'cloudflare ping',
                                status: data.pingList['1.1.1.1'],
                                icon: shallowRef(Cloud),
                            },
                            {
                                message: 'google ping',
                                status: data.pingList['8.8.8.8'],
                                icon: shallowRef(LogoGoogle),
                            },
                        ]
                    })
            }, 500)
        },
    },
    beforeDestroy() {
        clearInterval(this.polling)
    },
    created() {
        this.isLoading = true
        if (!this.isFetching) {
            this.isFetching = true
        } else return
        fetch(endpoints.CLIENTS)
            .then((res) => {
                this.isFetching = false
                this.isLoading = false
                return res.json()
            })
            .then(({ data }) => (this.peers = data.filter((i) => !!i)))
        fetch(endpoints.DIAGNOSTICS)
            .then((res) => {
                this.isFetching = false
                return res.json()
            })
            .then(({ data }) => {
                this.diagnostic = [
                    {
                        message: 'wireguard service',
                        status: data.serviceStatus,
                    },
                    {
                        message: 'cloudflare ping',
                        status: data.pingList['1.1.1.1'],
                    },
                    {
                        message: 'google ping',
                        status: data.pingList['8.8.8.8'],
                    },
                ]
            })
        this.pollData()
    },
})
</script>
