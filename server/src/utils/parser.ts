export default (command: string, stdout: string) => {
    switch (command) {
        case 'systemctl status wg-quick@wg0.service':
            const [key, value] = stdout
                .split('\n')
                .find((line) => line.includes('ActiveState'))
                ?.split('ActiveState=') || ['ActiveState=', '']
            return { status: value === 'active' }
        case 'wg show':
            const peers = stdout
                .replaceAll(' ', '')
                .split('\n\n')
                .map((i) => i.split('\n'))
                .filter((i) => i[0].includes('peer'))
                .map((i) => {
                    const [publicKey, psk, endpoint, allowedIps, lastTlsHandshake, transfer] = i
                    return {
                        publicKey: !!publicKey ? publicKey.split('peer:')[1] : null,
                        endpoint: !!endpoint ? endpoint.split('endpoint:')[1] : null,
                        allowedIps: !!allowedIps ? allowedIps.split('allowedips:')[1] : null,
                        lastTlsHandshake: !!lastTlsHandshake
                            ? String(lastTlsHandshake.split('latesthandshake:')[1]).replace('ago', '')
                            : null,
                        transfer: !!transfer
                            ? transfer
                                  .split('transfer:')[1]
                                  .split(',')
                                  .reduce(
                                      (acc, curr, i) => ({
                                          ...acc,
                                          [i === 0 ? 'recieved' : 'sent']: String(curr)
                                              .replace('received', '')
                                              .replace('sent', ''),
                                      }),
                                      { recieved: null, sent: null }
                                  )
                            : { recieved: null, sent: null },
                    }
                })
            return { peers }
        case 'cat /etc/wireguard/wg0.conf':
            const [_, ...rest] = stdout.split('\n\n').map((i) => i.split('\n'))
            const entriers = rest.map(([client, _, publicKey, psk, allowedIps]) => ({
                client: !!client ? client.split('### Client ')[1] : null,
                publicKey: !!publicKey ? publicKey.split('PublicKey = ')[1] : null,
                allowedIps: !!allowedIps ? allowedIps.split('AllowedIPs = ')[1] : null,
            }))
            return { entriers }
        case 'top -b -n 1':
            const [topStr, tasksStr, cpuStr, memStr, swapStr] = stdout.split('\n').map((i) => i.replaceAll(' ', ''))
            const total = memStr.split(':')[1].split(',')[0].split('total')[0]
            const used = memStr.split(':')[1].split(',')[2].split('used')[0]
            return {
                status: [
                    {
                        name: 'RAM',
                        message: [used, '/', total].join(''),
                        percent: ((parseInt(used)) / parseInt(total)) * 100
                    },
                    {
                        name: 'CPU',
                        message: cpuStr.split(',')[1].split('sy')[0],
                        precent: parseInt(cpuStr.split(',')[1].split('sy')[0]),
                    }
                ]
            }
        case 'wg genkey':
            return {
                key: stdout.trim()
            };
        case 'wg pubkey':
            return {
                key: stdout.trim()
            };
        case 'wg genpsk':
            return {
                key: stdout.trim()
            };
        default:
            return {}
    }
}
