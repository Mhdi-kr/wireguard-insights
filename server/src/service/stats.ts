import cp from 'child_process'
import util from 'util'
import ping from 'ping'
import parser from '../utils/parser'

const destinations = [
    {
        name: 'cloudflare',
        ip: '1.1.1.1',
    },
    {
        name: 'google',
        ip: '8.8.8.8',
    },
]

const exec = util.promisify(cp.exec)

const checkWireguard = async () => {
    const { stderr, stdout } = await exec('systemctl --no-page show wg-quick@wg0.service')
    const { status } = parser('systemctl status wg-quick@wg0.service', stdout)
    return status
}

const checkConnection = () => {
    return Promise.all(
        destinations.map(async ({ name, ip }) => {
            const { host, alive, time } = await ping.promise.probe(ip)
            return {
                name,
                host,
                alive,
                time,
            }
        })
    )
}

const checkSystemResources = async () => {
    const { stdout, stderr } = await exec('top -b -n 1')
    const { status } = parser('top -b -n 1', stdout)
    return status
}

/**
 * returns the systemctl status of wireguard service and ping status to cloudflare and google dns resolver endpoints
 */
export default async () => {
    // todo handle this error
    const [wireguardService, ping, resources] = await Promise.all([
        checkWireguard(),
        checkConnection(),
        checkSystemResources(),
    ])
    return {
        resources,
        ping: [
            {
                name: 'wireguard',
                host: null,
                alive: wireguardService,
                message: wireguardService ? 'active' : 'inactive',
                time: null
            },
            ...ping
        ],
    }
}
