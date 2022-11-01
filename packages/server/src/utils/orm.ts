import cp from 'child_process';
import util from 'util';
const exec = util.promisify(cp.exec)
import fs from 'fs/promises';
import { db, run, finalize, all } from './db';
import { DataUnit } from 'digital-unit-converter';
import parser from './parser';

const WG_CONFIG_FILE_PATH = '/etc/wireguard/';
export type Address = {
  IPv4: {
    address: string,
    range: number
  },
  IPv6: {
    address: string,
    range: number
  }
}
type Interface = {
  Address: Address;
  ListenPort: number;
  MTU: number;
  PostUp: string;
  PostDown: string;
  PrivateKey: string;
};

export type Peer = {
  client: string;
  publicKey: string;
  allowedIps: string;
  presharedKey: string;
  isSuspended?: boolean;
};

type ConfigType = {
  iface: Interface;
  interfaceName: string;
  peers: Peer[];
  save: () => Promise<void>
};

const deserializer = (fileContent: string) => {
  const [rawServerInterface, ...rawPeers] = fileContent.split('\n\n').map((i) => i.split('\n'))
  
  const peers = rawPeers.map(([client, _, publicKey, psk, allowedIps]) => ({
      client: !!client ? client.split('### Client ')[1] : null,
      publicKey: !!publicKey ? publicKey.split('PublicKey = ')[1] : null,
      allowedIps: !!allowedIps ? allowedIps.split('AllowedIPs = ')[1] : null,
      presharedKey: !!psk ? psk.split('PresharedKey = ')[1] : null,
      isSuspended: !!publicKey ? publicKey[0] === '#' : false
  })) as Peer[];
  const serverInterface = rawServerInterface.reduce((si, l) => {
    const [key, value] = l.split(' =').map(s => s.trim());
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
${p.isSuspended ? '#' : ''}[Peer]
${p.isSuspended ? '#' : ''}PublicKey = ${p.publicKey}
${p.isSuspended ? '#' : ''}PresharedKey = ${p.presharedKey}
${p.isSuspended ? '#' : ''}AllowedIPs = ${p.allowedIps}
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
  interfaceName: string;
  constructor(rawContent: string, interfaceName: string) {
    const res = deserializer(rawContent)
    this.interfaceName = interfaceName;
    this.iface = res.iface;
    this.peers = res.peers;
  }
  async save() {
    const rawContent = serializer(this);    
    await fs.writeFile(WG_CONFIG_FILE_PATH + this.interfaceName + '.conf', rawContent);
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
  async upsertPeers(iface: string, pubkeys: string[]) {
    try {
      const stmt = db.prepare("INSERT INTO peers VALUES (?, ?, ?, ?, ?)");
      for (const pubkey of pubkeys) {
        await run(stmt, [pubkey, 0, 0, iface, 10]);
      }
      await finalize(stmt);
    } catch (error) {
      // console.log(error);
    }
  }
  async resetRemainingTraffic(pubkey: string) {
    const statement = db.prepare('UPDATE peers SET remaining = ? WHERE public_key = ?');
    await run(statement, [10, pubkey]);
  }
  async updateTrafficUsage(pubkey: string, sent: string, received: string) {
    const dataUnitMap = {
      'B': DataUnit.BYTE,
      'KiB': DataUnit.KIBIBYTE,
      'MiB': DataUnit.MEBIBYTE,
      'GiB': DataUnit.GIBIBYTE
    };
    const sentUnit = sent.slice(-3);
    const sentAmount = sent.slice(0, -3 + sent.length);
    const receivedUnit = received.slice(-3);
    const receivedAmount = received.slice(0, -3 + received.length);
    const [firstPeer] = await all('SELECT * FROM peers WHERE public_key = ' + `'${pubkey}'`);
    const sentGbs = DataUnit.GIGABYTE.convert(parseFloat(sentAmount), dataUnitMap[sentUnit]);
    const receivedGbs = DataUnit.GIGABYTE.convert(parseFloat(receivedAmount), dataUnitMap[receivedUnit]);
    const diffSent = sentGbs - firstPeer.sent;
    const diffReceived = receivedGbs - firstPeer.received;
    const statement = db.prepare('UPDATE peers SET sent = ?, received = ?, remaining = ? WHERE public_key = ?');
    const newRemainingAmount = firstPeer.remaining - (diffSent + diffReceived);
    if (newRemainingAmount === 0 || newRemainingAmount < 0) {
      const peer = this.selectInterface('wg0').peers.find(p => p.publicKey === pubkey);
      peer.isSuspended = true;
      await this.selectInterface('wg0').save();
      await exec('wg syncconf wg0 <(wg-quick strip wg0)', { shell: '/bin/bash' });
    }
    await run(statement, [sentGbs, receivedGbs, newRemainingAmount, pubkey]);
  }
  async loadInterfaces() {
    const readInterfaceConfig = async () => {
      const configFiles = (await fs.readdir(WG_CONFIG_FILE_PATH)).filter(f => f.includes('.conf'));
      const results = await Promise.all(configFiles.map(async (cf) => {
        const configFileContents = await fs.readFile(WG_CONFIG_FILE_PATH + cf, { 'encoding': 'utf-8' });
        const interfaceName = cf.split('.conf')[0];
        return {
          config: new Config(configFileContents, interfaceName),
          interfaceName
        }
      }));
      this.interfaces = results.reduce((acc, { config, interfaceName }) => ({
        ...acc,
        [interfaceName]: config
      }), {});
      const promises = results.map(async (r) => {
        await this.upsertPeers(r.interfaceName, r.config.peers.map(p => p.publicKey))
      });
      await Promise.all(promises);
    };
    const upsertPeersInterval = setInterval(readInterfaceConfig, 1000 * 60 * 5);
    await readInterfaceConfig();
    const updateTrafficUsageInterval = setInterval(async () => {
      const [wgShow] = await Promise.all([exec("wg show")])
      const { peers } = parser('wg show', wgShow.stdout)
      const { peers: entries } = this.selectInterface('wg0')
      const promises = peers?.map(async (peer) => {
          const foundClient = entries?.find(entry => entry.publicKey === peer.publicKey)
          if (!foundClient) return null
          await this.updateTrafficUsage(peer.publicKey, peer.transfer.sent, peer.transfer.recieved);
      });
      await Promise.all(promises);
    }, 1000 * 60 * 5);
  }
};