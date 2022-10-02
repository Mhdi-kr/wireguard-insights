import cp from 'child_process'
import util from 'util'
import ping from 'ping'
import parser from '../utils/parser'

const exec = util.promisify(cp.exec)

const checkWireguard = async () => {
    const { stderr, stdout } = await exec('systemctl --no-page show wg-quick@wg0.service')
    const { status } = parser('systemctl status wg-quick@wg0.service', stdout)
    return status
}

const checkConnection = () => {
    return Promise.all(
        ['1.1.1.1', '8.8.8.8', '8.8.4.4'].map(async (destination) => await ping.promise.probe(destination))
    )
}

const checkSystemResources = () => {
    return exec('top -b -n 1')
}

/**
 * returns the systemctl status of wireguard service and ping status to cloudflare and google dns resolver endpoints
 */
export default async () => {
    const [serviceStatus, pingList, top] = await Promise.all([checkWireguard(), checkConnection(), checkSystemResources()])
    return {
        serviceStatus,
        serverStats: {
            ...parser('top -b -n 1', top.stdout)
        },
        pingList: pingList.reduce((acc, curr) => ({ ...acc, [curr.host]: {
            alive: curr.alive,
            time: curr.time
        } }), {}),
    }
}
