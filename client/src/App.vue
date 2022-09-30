<template>
    <diagnostic-toolbar :diagnostics="diagnostic" />
    <clients-table :clients="peers" />
</template>

<script lang="ts">
import { defineComponent, shallowRef } from 'vue'
import { LogoGoogle, Cloud, Shield } from '@vicons/ionicons5'
import ClientsTable from './components/ClientsTable.vue'
import DiagnosticToolbar from './components/DiagnosticToolbar.vue'

export default defineComponent({
    components: {
        ClientsTable,
        DiagnosticToolbar,
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
                fetch('http://176.9.213.130:5000/api/v1/clients')
                    .then((res) => {
                        this.isFetching = false
                        return res.json()
                    })
                    .then(({ data }) => (this.peers = data.filter(i => !!i)))
                fetch('http://176.9.213.130:5000/api/v1/diagnostic')
                    .then((res) => {
                        this.isFetching = false
                        return res.json()
                    })
                    .then(({ data }) => {
                        this.diagnostic = [
                            {
                                message: 'wireguard service',
                                status: data.serviceStatus,
                                icon: shallowRef(Shield)
                            },
                            {
                                message: 'cloudflare ping',
                                status: data.pingList['1.1.1.1'],
                                icon: shallowRef(Cloud)
                            },
                            {
                                message: 'google ping',
                                status: data.pingList['8.8.8.8'],
                                icon: shallowRef(LogoGoogle)
                            },
                        ]
                    })
            }, 300)
        },
    },
    beforeDestroy() {
        clearInterval(this.polling)
    },
    created() {
        if (!this.isFetching) {
            this.isFetching = true
        } else return
        fetch('http://176.9.213.130:5000/api/v1/clients')
            .then((res) => {
                this.isFetching = false
                return res.json()
            })
            .then(({ data }) => (this.peers = data.filter(i => !!i)))
        fetch('http://176.9.213.130:5000/api/v1/diagnostic')
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
