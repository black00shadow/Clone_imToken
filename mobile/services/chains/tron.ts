import { ethers } from 'ethers';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TronWeb = require('tronweb');

const TRON_PATH = (index: number) => `m/44'/195'/0'/0/${index}`;

export function deriveTronAccount(mnemonic: string, index: number) {
  const hd = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, TRON_PATH(index));
  const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
  const privateKey = hd.privateKey.startsWith('0x') ? hd.privateKey.slice(2) : hd.privateKey;
  const address = tronWeb.address.fromPrivateKey(privateKey);
  return { address: address as string, privateKey };
}

export async function getTronBalance(address: string): Promise<string> {
  try {
    const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
    const sun = await tronWeb.trx.getBalance(address);
    return tronWeb.fromSun(sun);
  } catch {
    return '0';
  }
}

export async function sendTron(privateKey: string, to: string, amountTrx: string): Promise<string> {
  const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io', privateKey: key });
  const sun = tronWeb.toSun(parseFloat(amountTrx));
  const tx = await tronWeb.trx.sendTransaction(to, sun);
  if (!tx.result) throw new Error(tx.message ?? 'TRON send failed');
  return tx.txid;
}

export async function getTronHistory(address: string, limit = 20) {
  try {
    const res = await fetch(
      `https://api.trongrid.io/v1/accounts/${address}/transactions?limit=${limit}&only_confirmed=true`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map((tx: { txID: string; raw_data: { contract: { parameter: { value: { amount?: number; owner_address?: string; to_address?: string } } }[] } }) => ({
      hash: tx.txID,
      from: tx.raw_data?.contract?.[0]?.parameter?.value?.owner_address ?? '',
      to: tx.raw_data?.contract?.[0]?.parameter?.value?.to_address ?? '',
      value: String((tx.raw_data?.contract?.[0]?.parameter?.value?.amount ?? 0) / 1e6),
    }));
  } catch {
    return [];
  }
}
