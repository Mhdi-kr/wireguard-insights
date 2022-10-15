import wireguard from './wireguard'
import ping from 'ping'

const onlyUnique = (value: any, index: any, self: any) => {
    return self.indexOf(value) === index
}

export default {
    /**
     * pings unique list of client endpoints for time and packetloss
     */
    run: async () => {
        const clients = await wireguard.getClients()
        // console.log(clients)
        const uniqueEndpoints = clients.map((client) => client.endpoint).filter(Boolean).map(endpoint => endpoint.split(':')[0]).filter(onlyUnique)
        const pingedEndpoints = await Promise.all(uniqueEndpoints.map(endpoint => ping.promise.probe(endpoint)))
        return pingedEndpoints.map(({ alive, time, host, packetLoss }) => ({ alive, time, host, packetLoss }))
    },
}
