import cp from 'child_process'
import util from 'util'
import ping from 'ping'
import parser from '../utils/parser'
import { ORMInstance } from '../index'
import { findMachinePublicIp, findUnusedIp, generateAllowedIps } from '../utils/ip'

const exec = util.promisify(cp.exec)

export default {
    /**
     * get a list of all client objects
     */
    getClients: async () => {
        const [wgShow] = await Promise.all([exec("wg show")])
        const { peers } = parser('wg show', wgShow.stdout)
        const { peers: entries } = ORMInstance.selectInterface('wg0')
        const entryPeerJoin = peers?.map(peer => {
            const foundClient = entries?.find(entry => entry.publicKey === peer.publicKey)
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
    createClient: async (deps: {
        name: string,
        excludeIps?: string[],
        endpoint?: string,
        endpointListenPort?: string
    }) => {
        // create private key
        const generatePrivateKeyCommand = 'wg genkey';
        const [wgGenkey] = await Promise.all([exec(generatePrivateKeyCommand)]);
        const { key: clientPrivateKey} = parser(generatePrivateKeyCommand, wgGenkey.stdout);
        // create publickey
        const generatePublicKeyCommand = `echo ${clientPrivateKey} | wg pubkey`;
        const [wgGenPubKey] = await Promise.all([exec(generatePublicKeyCommand)]);
        const { key: clientPublicKey } = parser('wg pubkey', wgGenPubKey.stdout);
        // create preshared key
        const generatePresharedKey = 'wg genpsk';
        const [wgGenPsk] = await Promise.all([exec(generatePresharedKey)]);
        const { key: clientPresharedKey } = parser(generatePresharedKey, wgGenPsk.stdout);
        // find unused ip for new client
        const { peers, iface } = ORMInstance.selectInterface('wg0')
        const unusedIp = findUnusedIp(
            iface.Address,
            peers
        );
        const clientAddress = `${unusedIp.IPv4.address}/${unusedIp.IPv4.range},${unusedIp.IPv6.address}/${unusedIp.IPv6.range}`;
        const allowedIps = await generateAllowedIps(deps.excludeIps);
        const machinePublicIp = await findMachinePublicIp();
        // Update server conf
        console.log(peers, iface);
        ORMInstance.selectInterface('wg0').peers.push({
            client: deps.name,
            publicKey: clientPublicKey,
            allowedIps: clientAddress,
            presharedKey: clientPresharedKey
        });
        await ORMInstance.selectInterface('wg0').save()
        await exec('wg syncconf wg0 <(wg-quick strip wg0)', { shell: '/bin/bash' })
        // create server public key
        const generateServerPublicKeyCommand = `echo ${iface.PrivateKey} | wg pubkey`;
        const [wgGenServerPubKey] = await Promise.all([exec(generateServerPublicKeyCommand)]);
        const { key: serverPublicKey } = parser('wg pubkey', wgGenServerPubKey.stdout);
        return {
            rawContent: `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${clientAddress}
DNS = 1.1.1.1,8.8.8.8

[Peer]
PublicKey = ${serverPublicKey}
PresharedKey = ${clientPresharedKey}
Endpoint = ${deps.endpoint || machinePublicIp}:${deps.endpointListenPort || iface.ListenPort}
AllowedIPs = ${allowedIps}
`
        };
    },
    /**
     * modify an existing client fetched by its
     * @param {any} deps:any
     */
    editClient: async (pk: string, payload: any) => { },
    /**
     * revoke an existing client fetched by its public key
     */
    revokeClient: async (pk: string) => {
        ORMInstance.selectInterface('wg0').peers = ORMInstance.selectInterface('wg0').peers.filter(p => p.publicKey !== pk);
        console.log(ORMInstance.selectInterface('wg0').peers, pk);
        await ORMInstance.selectInterface('wg0').save();
        await exec('wg syncconf wg0 <(wg-quick strip wg0)', { shell: '/bin/bash' });
        return {
            success: true,
            deletedUserKey: pk
        };
    },
    suspendClient: async (pk: string) => {
        const peer = ORMInstance.selectInterface('wg0').peers.find(p => p.publicKey === pk);
        peer.isSuspended = true;
        await ORMInstance.selectInterface('wg0').save();
        await exec('wg syncconf wg0 <(wg-quick strip wg0)', { shell: '/bin/bash' });
        return {
            success: true,
            suspendedPublicKey: pk
        };
    },
    unsuspendClient: async (pk: string, shouldResetRemaining: boolean) => {
        const peer = ORMInstance.selectInterface('wg0').peers.find(p => p.publicKey === pk);
        peer.isSuspended = false;
        await ORMInstance.selectInterface('wg0').save();
        if (shouldResetRemaining) {
            await ORMInstance.resetTrafficRemaining(pk);
        }
        await exec('wg syncconf wg0 <(wg-quick strip wg0)', { shell: '/bin/bash' });
        return {
            success: true,
            unsuspendedPublicKey: pk
        };
    },
}
