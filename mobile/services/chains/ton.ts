import { ethers } from 'ethers';

export function deriveTonAddress(
  mnemonic: string,
  index: number,
): { address: string; privateKey: string } {
  const hd = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, `m/44'/607'/0'/0/${index}`);
  const privateKey = hd.privateKey.startsWith('0x') ? hd.privateKey.slice(2) : hd.privateKey;
  const hash = ethers.keccak256(hd.signingKey.publicKey).replace('0x', '');
  const address = `EQ${hash.slice(0, 46)}`;
  return { address, privateKey };
}

export async function getTonBalance(address: string): Promise<string> {
  try {
    const res = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(address)}`);
    const data = await res.json();
    if (!data.ok) return '0';
    return (parseInt(data.result ?? '0', 10) / 1e9).toFixed(4);
  } catch {
    return '0';
  }
}
