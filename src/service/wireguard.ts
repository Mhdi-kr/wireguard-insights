import cp from 'child_process'
import util from 'node:util'

const exec = util.promisify(cp.exec)

export default {
    /**
     * get a list of all client objects
     */
    getClients: async () => {
        // cmd: [
        //     "ping",
        //     "-c1",
        //     "-w3",
        //     client.allowedIps.split('/')[0]
        // ],
        // peers.map(i => {
        //     const foundClient = clientTable.find(j => j.publicKey === i.publicKey)
        //     if(!foundClient) return null
        //     return {
        //         ...i,
        //         ...foundClient
        //     }
        // })
        return [] as Array<{
            name: string
            endpoint: string
            allowedIps: string
            lastLtsHandshake: string
            transfer: { received: string; sent: string }
        }>
    },
    /**
     * get a certain client by its public key string
     * @param {any} pk:string
     */
    getClientByPK: async (pk: string) => {
        return {}
    },
    /**
     * create a new client
     * @param {any} deps:any
     */
    createClient: async (deps: any) => {
        return {}
    },
    /**
     * modify an existing client fetched by its
     * @param {any} deps:any
     */
    editClient: async (pk: string, payload: any) => {},
    /**
     * revoke an existing client fetched by its public key
     */
    revokeClient: async (pk: string) => {},
}
