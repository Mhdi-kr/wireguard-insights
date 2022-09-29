import cp from 'child_process'
import util from 'node:util'
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

export default async () => {
    const [ serviceStatus, pingList ] = await Promise.all([checkWireguard(), checkConnection()])
    return {
        serviceStatus,
        pingList: pingList.reduce((acc, curr) => ({ ...acc, [curr.host]: curr.alive }), {}),
    }
}
