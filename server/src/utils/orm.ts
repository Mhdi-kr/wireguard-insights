import fs from 'fs/promises';

const WG_CONFIG_FILE_PATH = '/etc/wireguard/';
type Interface = {
  Address: {
    IPv4: {
      address: string,
      range: number
    },
    IPv6: {
      address: string,
      range: number
    },
  };
  ListenPort: number;
  MTU: number;
  PostUp: string;
  PostDown: string;
  PrivateKey: string;
};

type Peer = {
  client: string;
  publicKey: string;
  allowedIps: string;
  presharedKey: string;
};

type ConfigType = {
  iface: Interface;
  peers: Peer[];
};

const deserializer = (fileContent: string) => {
  const [rawServerInterface, ...rawPeers] = fileContent.split('\n\n').map((i) => i.split('\n'))
  
  const peers = rawPeers.map(([client, _, publicKey, psk, allowedIps]) => ({
      client: !!client ? client.split('### Client ')[1] : null,
      publicKey: !!publicKey ? publicKey.split('PublicKey = ')[1] : null,
      allowedIps: !!allowedIps ? allowedIps.split('AllowedIPs = ')[1] : null,
      presharedKey: !!psk ? psk.split('PresharedKey = ')[1] : null,
  })) as Peer[];
  const serverInterface = rawServerInterface.reduce((si, l) => {
    const [key, value] = l.split('=').map(s => s.trim());
    switch (key.toLowerCase()) {
      case 'address': {
        si[key] = value.split(',').reduce((addr, ipWithRange, i) => {
          const [ip, range] = ipWithRange.split('/');
          if (i === 0) {
            addr['IPv4'] = {
              address: ip,
              range: Number(range),
            };
          } else {
            addr['IPv6'] = {
              address: ip,
              range: Number(range),
            };
          }
          return addr;
        }, {})
        return si;
      }
      case 'listenport': {
        si[key] = Number(value);
        return si;
      }
      case 'mtu': {
        si[key] = Number(value);
        return si;
      }
      case 'postup': {
        si[key] = value;
        return si;
      }
      case 'postdown': {
        si[key] = value;
        return si;
      }
      case 'privatekey': {
        si[key] = value;
        return si;
      }
      default:
        return si;
    }
  }, {} as Interface);
  return {
    iface: serverInterface,
    peers: peers.filter(p => !!p.client && !!p.publicKey)
  } as Config
};

const serializer = (config: Config) => {
  const serializedPeers = config.peers.reduce((r, p) => {
    return `${r}
### Client ${p.client}
[Peer]
PublicKey = ${p.publicKey}
PresharedKey = ${p.presharedKey}
AllowedIPs = ${p.allowedIps}
`;
  }, '');
  const ipv4AddressWithRange = `${config.iface.Address.IPv4.address}/${config.iface.Address.IPv4.range}`;
  const ipv6AddressWithRange = `${config.iface.Address.IPv6.address}/${config.iface.Address.IPv6.range}`;
  const serializedConfig = `[Interface]
Address = ${ipv4AddressWithRange},${ipv6AddressWithRange}
ListenPort = ${config.iface.ListenPort}
MTU = ${config.iface.MTU}
PrivateKey = ${config.iface.PrivateKey}
PostUp = ${config.iface.PostUp}
PostDown = ${config.iface.PostDown}
${serializedPeers} 
`;
  return serializedConfig;  
};

class Config implements ConfigType {
  peers: Peer[];
  iface: Interface;
  constructor(rawContent: string) {
    const res = deserializer(rawContent)
    this.iface = res.iface;
    this.peers = res.peers;
  }
  toJSON() {
    const iface = {
      ...this.iface
    };
    delete iface.PrivateKey;
    const peers = this.peers.map(p => {
      delete p.presharedKey;
      return p;
    });
    return {
      interface: iface,
      peers
    };
  }
}

export class ORM {
  interfaces: { [key: string]: Config };
  selectInterface(name: string) {
    return this.interfaces[name];
  }
  async loadInterfaces() {
    const configFiles = (await fs.readdir(WG_CONFIG_FILE_PATH)).filter(f => f.includes('.conf'));
    const results = await Promise.all(configFiles.map(async (cf) => {
      const configFileContents = await fs.readFile(WG_CONFIG_FILE_PATH + cf, { 'encoding': 'utf-8' });
      return {
        config: new Config(configFileContents),
        interfaceName: cf.split('.conf')[0]
      }
    }));
    this.interfaces = results.reduce((acc, { config, interfaceName }) => ({
      ...acc,
      [interfaceName]: config
    }), {});
  }
};