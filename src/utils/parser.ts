export default (command: string, stdout: string) => {
    switch (command) {
        case 'wg show':
            const peers = stdout
                .replaceAll(' ', '')
                .split('\n\n')
                .map((i) => i.split('\n'))
                .filter((i) => i[0].includes('peer'))
                .map((i) => {
                    const [ publicKey, psk, endpoint, allowedIps, lastTlsHandshake, transfer ] = i
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
            const entriers = rest.map(([client, _, publicKey, psk,allowedIps]) => ({
                client: !!client ? client.split('### Client ')[1] : null,
                publicKey: !!publicKey ? publicKey.split('PublicKey = ')[1] : null,
                allowedIps: !!allowedIps ? allowedIps.split('AllowedIPs = ')[1] : null,
            }))
            return { entriers }
        default:
            return {}
    }
}
