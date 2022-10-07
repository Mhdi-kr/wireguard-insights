import axios from 'axios';
import cp from 'child_process';
import util from 'util';
import { Address, Peer } from './orm';
const exec = util.promisify(cp.exec);

export const findUnusedIp = (wgServerAddresses: Address, entries: Peer[]) => {
  // Assume the both IPv4 and IPv6 are free at a
  // specific address and we do not need to calculate
  // free address for both IP versions
  const ips = entries.map(e => e.allowedIps.split('/')[0]);
  const occupiedAddresses = ips.map(ip => Number(ip.split('.')[3]));  
  let startAddress = Number(wgServerAddresses.IPv4.address.split('.')[3]) + 1;
  while (occupiedAddresses.includes(startAddress)) {
    startAddress++;
  }
  const unusedAddress = wgServerAddresses.IPv4.address.split('.');
  unusedAddress.pop();
  unusedAddress.push(`${startAddress}`);
  const unusedV6Address = wgServerAddresses.IPv6.address.split('::');
  return {
    IPv4: {
      address: unusedAddress.join('.'),
      range: 32
    },
    IPv6: {
      address: unusedV6Address.join(':').concat('::', String(startAddress)),
      range: 128
    }
  } as Address;
};

export const generateAllowedIps = async (excludeIps?: string[]) => {
  if (!excludeIps) {
    return '0.0.0.0/0,::/0';
  }
  const { data: { data: result } } = await axios.get('https://hooks.arcemtene.com/wireguard/allowedips', {
    params: {
      allowed: '0.0.0.0/0, ::/0',
      disallowed: excludeIps.join(',')
    }
  });
  result.pop();
  result.push({ id: '::/1' }, { id: '8000::/1' });
  return result.map((r: { id: string }) => r.id).join(',');
}

export const findMachinePublicIp = async () => {
  const { stdout } = await exec(`ip -4 addr | sed -ne 's|^.* inet \\([^/]*\\)/.* scope global.*$|\\1|p' | awk '{print $1}' | head -1`);
  return stdout.trim();
};