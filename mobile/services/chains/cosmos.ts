import { ethers } from 'ethers';
import { bech32 } from 'bech32';

const COSMOS_PATH = (index: number) => `m/44'/118'/0'/0/${index}`;

export function deriveCosmosAddress(mnemonic: string, index: number, prefix = 'cosmos'): string {
  const hd = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, COSMOS_PATH(index));
  const pubKey = ethers.getBytes(hd.signingKey.publicKey);
  const sha = ethers.getBytes(ethers.sha256(pubKey));
  const addrBytes = sha.slice(0, 20);
  return bech32.encode(prefix, bech32.toWords(addrBytes));
}

export async function getCosmosBalance(
  address: string,
  restUrl = 'https://cosmos-rest.publicnode.com',
): Promise<string> {
  try {
    const res = await fetch(`${restUrl}/cosmos/bank/v1beta1/balances/${address}`);
    if (!res.ok) return '0';
    const data = await res.json();
    const atom = data.balances?.find((b: { denom: string }) => b.denom === 'uatom');
    return atom ? (parseInt(atom.amount, 10) / 1e6).toFixed(4) : '0';
  } catch {
    return '0';
  }
}

export function deriveOsmosisAddress(mnemonic: string, index: number): string {
  return deriveCosmosAddress(mnemonic, index, 'osmo');
}
