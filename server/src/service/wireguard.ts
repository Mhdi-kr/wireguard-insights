import cp from 'child_process'
import util from 'util'
import parser from '../utils/parser'
import ping from 'ping'

const exec = util.promisify(cp.exec)

export default {
    /**
     * get a list of all client objects
     */
    getClients: async () => {
        const [wgShow, catConfig] = await Promise.all([exec("wg show"), exec("cat /etc/wireguard/wg0.conf")])
        const { peers } = parser('wg show', wgShow.stdout)
        const { entriers } = parser('cat /etc/wireguard/wg0.conf', catConfig.stdout)
        const entryPeerJoin = peers?.map(peer => {
            const foundClient = entriers?.find(entry => entry.publicKey === peer.publicKey)
            if (!foundClient) return null
            return {
                ...peer,
                ...foundClient
            }
        }).filter(Boolean) || []
        const pingedList = entryPeerJoin.map(async (client) => {
            if(!client) return null
            const [ destinationIp ] = client.allowedIps?.split('/') || '/'
            const { alive } = await ping.promise.probe(destinationIp, { deadline: 3, min_reply: 1 })
            return { ...client, status: alive }
        }).filter(Boolean)

        return await Promise.all(pingedList)
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
    editClient: async (pk: string, payload: any) => { },
    /**
     * revoke an existing client fetched by its public key
     */
    revokeClient: async (pk: string) => { },
}
