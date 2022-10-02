<template>
    <n-config-provider :theme="darkTheme">
        <div class="container">
            <toolbar v-model:query="query" class="toolbar" :stats="stats" />
            <clients-table :loading="loading" @dropdown-item-clicked="handleDropdownItem" :clients="filteredClients" />
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

<script lang="ts" setup>
import { useFuse } from "@vueuse/integrations/useFuse";
import { computed, onBeforeUnmount, ref } from "vue";
import { useFetch } from "@vueuse/core";
import { darkTheme, NConfigProvider } from "naive-ui";
import ClientsTable from "./components/ClientsTable.vue";
import Toolbar from "./components/Toolbar.vue";
import endpoints from "./endpoints";

const POLLING_INTERVAL = 750; // ms

const clientFetcher = useFetch(endpoints.CLIENTS).json();
const statsFetcher = useFetch(endpoints.STATS).json();

const fetchInterval = setInterval(() => {
    if (statsFetcher.isFinished.value) {
        statsFetcher.execute();
    }
    if (clientFetcher.isFinished.value) {
        clientFetcher.execute();
    }
}, POLLING_INTERVAL);

const loading = computed(
    () => clients.value.length === 0 && clientFetcher.isFetching
);

const stats = computed(() => {
    if(!statsFetcher.data.value) return { resources: {} }
    const { data } = statsFetcher.data.value;
    return data
});

const resources = computed(() => {
    if (!statsFetcher.data.value) return [];
    const {
        data: { serverStats },
    } = statsFetcher.data.value;
    return [
        {
            name: "ram",
        },
    ];
});

const clients = computed(() => {
    if (!clientFetcher.data.value) return [];
    const { data } = clientFetcher.data.value;
    return data.filter((client) => !!client);
    // console.log(statsFetcher.json().data.value);
});

const pins = ref([]);

const handleDropdownItem = (payload) => {
    const { option, row } = payload;
    const key = String(option.key).toLocaleLowerCase();
    switch (key) {
        case "pin":
            const indexOfFound = pins.value.indexOf(row.publicKey);
            return indexOfFound == -1
                ? pins.value.push(row.publicKey)
                : pins.value.splice(indexOfFound, 1);
        default:
            return;
    }
};

const query = ref("");

const searchedClients = useFuse(query, clients, {
    fuseOptions: {
        keys: ["client", "allowedIps"],
        isCaseSensitive: false,
        threshold: 0.2,
    },
    matchAllWhenSearchEmpty: true,
}).results;

const filteredClients = computed(() => {
    let clients = searchedClients.value.map(({ item }) => ({ ...item }));
    clients = clients.map((client) => ({
        ...client,
        isPinned: pins.value.find((pk) => pk === client.publicKey) ? true : false,
    }));
    clients.sort((a, b) => b.isPinned - a.isPinned);
    return clients;
});

onBeforeUnmount(() => clearInterval(fetchInterval));
</script>

<!-- 
data() {
    return {
        stats: [],
        resources: [],
        isLoading: false,
        isFetching: false,
        peers: [],
        polling: null,
    };
},
methods: {
    pollData: function () {
        this.polling = setInterval(() => {
            if (!this.isFetching) {
                this.isFetching = true;
            } else return console.log("return");
            fetch(endpoints.CLIENTS)
                .then((res) => {
                    this.isFetching = false;
                    return res.json();
                })
                .then(({ data }) => (this.peers = data.filter((i) => !!i)));
            fetch(endpoints.STATS)
                .then((res) => {
                    this.isFetching = false;
                    return res.json();
                })
                .then(({ data }) => {
                    this.resources = data.serverStats;
                    this.stats = 
                });
        }, 500);
    },
},
beforeDestroy() {
    clearInterval(this.polling);
},
created() {
    this.isLoading = true;
    if (!this.isFetching) {
        this.isFetching = true;
    } else return null;
    fetch(endpoints.CLIENTS)
        .then((res) => {
            this.isFetching = false;
            this.isLoading = false;
            return res.json();
        })
        .then(({ data }) => (this.peers = data.filter((i) => !!i)));
    fetch(endpoints.STATS)
        .then((res) => {
            this.isFetching = false;
            return res.json();
        })
        .then(({ data }) => {
            this.stats = [
                {
                    message: "wireguard service",
                    status: data.serviceStatus,
                },
                {
                    message: "cloudflare ping",
                    status: data.pingList["1.1.1.1"],
                },
                {
                    message: "google ping",
                    status: data.pingList["8.8.8.8"],
                },
            ];
        });
    this.pollData();
}, -->
