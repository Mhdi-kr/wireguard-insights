const cp = require('child_process')
const util = require('node:util')
console.log(util.promisify)
const wgShowParser = (output) => {
    const peerParser = (str) => !!str ? str.split('peer:')[1] : null
    const pskParser = (str) => !!str ? str.split('presharedkey:')[1] : null
    const endpointParser = (str) => !!str ? str.split('endpoint:')[1] : null
    const lhsParser = (str) => !!str ? String(str.split('latesthandshake:')[1]).replace('ago', '') : null
    const aipParser = (str) => !!str ? str.split('allowedips:')[1] : null
    const transferParser = (str) => !!str ? str.split('transfer:')[1].split(',').reduce((acc, curr, i) => ({ ...acc, [i === 0 ? 'recieved' : 'sent']: String(curr).replace('received', '').replace('sent', '') }) , { recieved: null, sent: null }) : { recieved: null, sent: null }
    const peers = output.replaceAll(' ', '').split('\n\n').map(i => i.split('\n')).filter(i => i[0].includes('peer')).map(i => ({
        publicKey: peerParser(i[0]),
        psk: pskParser(i[1]),
        endpoint: endpointParser(i[2]),
        allowedIps: aipParser(i[3]),
        lhs: lhsParser(i[4]),
        transfer: transferParser(i[5])
    }))
    return {
        peers
    }
}

const wgClientsParser = (items) => {
    const client = !!items[0] ? items[0].split('### Client ')[1] : null
    const publicKey = !!items[2] ? items[2].split('PublicKey = ')[1] : null
    const allowedIps = !!items[4] ? items[4].split('AllowedIPs = ')[1] : null
    return {
        client,
        publicKey,
        allowedIps
    }
}

// const [ first, ...rest ] = clientRawString.split('\n\n').map(i => i.split('\n'))
//         const clientTable = rest.map(parser)
const Wireguard =  {
    getClients: async () => {
        
        return {
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
        }
    },
    getClientByPK: async (pk) => {
        return {}
    },
    createClient: async (deps) => {
        return {}
    },
    editClient: async () => {

    },
    revokeClient: async (pk) => {

    },
}

module.exports = Wireguard